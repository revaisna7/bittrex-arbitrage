var Model = require('../../system/Model.js');
var Util = require('../../system/Util.js');


module.exports = class BookBalancer extends Model {

    static Currency = require('./Currency.js');
    static Market = require('./Market.js');
    static OrderBook = require('./OrderBook.js');
    static Balance = require('./Balance.js');
    static Route = require('./Route.js');
    static Trade = require('./Trade.js');
    static Order = require('./Order.js');

    static output = "";

    static async start() {
        console.log('Initializing Balancer...');

        BookBalancer.Order.cancelAll();

        setTimeout(() => {
            BookBalancer.output += 'Trade all to BTC..<br>';
            for (var i in BookBalancer.Currency.config('allowed')) {
                var currency = BookBalancer.Currency.getBySymbol(BookBalancer.Currency.config('currencies')[i]);
                var balance = BookBalancer.Balance.getByCurrencySymbol(BookBalancer.Currency.config('currencies')[i]);
                if (balance && balance.getTotal() > 0) {
                    var trade = currency.tradeToBtc(balance.getTotal());

                    if (trade) {
                        BookBalancer.output += (trade.meetsMinTradeRequirement()) + "<br>";
                        BookBalancer.output += (trade.hasBalance()) + "<br>";
                        BookBalancer.output += (trade.getQuantity()) + "<br>";
                        trade.execute(() => {
                            BookBalancer.output += ('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity()) + "<br>";
                        });
                    }
                }
            }
            BookBalancer.Order.init();
            setTimeout(() => {
                Util.when(() => {
                    BookBalancer.output += ('Waiting for orders to fill...');
                    BookBalancer.Order.get();
                    return BookBalancer.Order.list.length !== 0;
                }, () => {
                    BookBalancer.Balance.getAll();
                    setTimeout(() => {
                        var btcQuantity = BookBalancer.Balance.getByCurrencySymbol('BTC').getTotal() / BookBalancer.Currency.config('allowed').length;
                        for (var i in BookBalancer.Currency.config('allowed')) {
                            var trade = BookBalancer.Currency.getBtc().tradeTo(BookBalancer.Currency.getBySymbol(BookBalancer.Currency.config('allowed')[i]), btcQuantity);
                            if (trade) {
                                BookBalancer.output += (trade.meetsMinTradeRequirement()) + "<br>";
                                BookBalancer.output += (trade.hasBalance()) + "<br>";
                                BookBalancer.output += (trade.getQuantity()) + "<br>";
                                trade.execute((trade) => {
                                    BookBalancer.output += ('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity()) + "<br>";
                                });
                            }
                        }
                    }, 5000);
                }, 5000);
            }, 5000);
        }, 5000);
    }

    static consoleOutput() {
        return BookBalancer.output;
    }

    static stop() {
        // todo
    }

};