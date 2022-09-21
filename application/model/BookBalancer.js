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

    static async rebalance() {
        console.log('Initializing Balancer...');
        await BookBalancer.closeOrders();
        setTimeout(BookBalancer.tradeToBtc, 5000);
        setTimeout(BookBalancer.tradeBtcToAll, 10000);
    }

    static async closeOrders() {
        console.log('Close all orders...');
        return await BookBalancer.Order.cancelAll();
    }

    static async tradeToBtc() {
        console.log('Trade all to BTC..');

        var allowedCurrencies = BookBalancer.Currency.getAllowed();


        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BookBalancer.Currency.BTC.symbol) {
                continue;
            }
            var balance = BookBalancer.Balance.getByCurrencySymbol(allowedCurrencies[i]);
            var price = currency.getMarket(BookBalancer.Currency.BTC).getMarketPrice(BookBalancer.Currency.BTC);
            
            console.log("price: " + balance.getTotal());
            console.log("total: " + balance.getTotal());
            
            var trade = currency.tradeToBtc(balance.getTotal(), price);
            if (trade) {
                try {
                    console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    await trade.execute((trade) => {
                        console.log('Executed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    });
                } catch (e) {
                    //console.log(e);
                }
            }
        }
        return await BookBalancer.Balance.getAll();
    }

    static async tradeBtcToAll() {
        console.log('Trade BTC to all..');
        var allowedCurrencies = BookBalancer.Currency.getAllowed();
        var totalCurrencies = allowedCurrencies.length;
        var totalBtc = BookBalancer.Balance.getByCurrencySymbol('BTC').getTotal();
        var totalRoutes = BookBalancer.Route.list.length;
        var currencyRoutes = []
        var currencyDivider = 0;

        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            currencyRoutes[i] = BookBalancer.Route.findByCurrency(currency);
            currencyDivider = currencyDivider + currencyRoutes[i].length;
        }
        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BookBalancer.Currency.BTC.symbol) {
                continue;
            }
            var btcQuantity = totalBtc * (currencyRoutes[i].length / currencyDivider);
            var trade = BookBalancer.Currency.BTC.tradeTo(currency, btcQuantity);
            if (trade) {
                try {
                    await trade.execute((trade) => {
                        console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    });
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log(trade);
            }
        }
        return await BookBalancer.Balance.getAll();
    }

    static consoleOutput() {
        return BookBalancer.output;
    }

    static stop() {
        // todo
    }

};