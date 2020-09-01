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
        console.log('Close all orders...');
        await BookBalancer.Order.cancelAll();
        console.log('Trade all to BTC..');
        for (var i in BookBalancer.Currency.getAllowed()) {
            var currency = BookBalancer.Currency.getBySymbol(BookBalancer.Currency.getAllowed()[i]);
            var balance = BookBalancer.Balance.getByCurrencySymbol(BookBalancer.Currency.getAllowed()[i]);
            var trade = currency.tradeToBtc(balance.getTotal());
            await trade.executeMarket((trade) => {
                console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
            });
        }
        await BookBalancer.Balance.getAll();
        console.log('Trade BTC to all..');
        var btcQuantity = BookBalancer.Balance.getByCurrencySymbol('BTC').getTotal() / BookBalancer.Currency.getAllowed().length;
        for (var i in BookBalancer.Currency.getAllowed()) {
            var trade = BookBalancer.Currency.getBtc().tradeTo(BookBalancer.Currency.getBySymbol(BookBalancer.Currency.getAllowed()[i]), btcQuantity);
            await trade.executeMarket((trade) => {
                console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
            });
        }
    }

    static consoleOutput() {
        return BookBalancer.output;
    }

    static stop() {
        // todo
    }

};