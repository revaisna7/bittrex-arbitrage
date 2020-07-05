//var Config = require('./Config.js');
//var bittrex = require('node-bittrex-api');
//bittrex.options(Config.get('bittrexoptions'));
//
//var bittrexv3 = require('bittrex-node-api');
//
//var Balance = require('./Balance.js');
//var Currency = require('./Currency.js');
//var Currencies = require('./Currency.js');
//var Routes = require('./Route.js');
//var Util = require('../../system/Util.js');
//
//module.exports = class BookBalancer {
//
//    static consoleOutput() {
//        
//    }
//
//}

console.log('Initiating...');
var Config = require('./model/Config.js');
Config.init();

var Market = require('./model/Market.js');
var OrderBook = require('./model/OrderBook.js');
var Currency = require('./model/Currency.js');
var Balance = require('./model/Balance.js');
var Order = require('./model/Order.js');
var Util = require('./model/Util.js');
var Trade = require('./model/Trade.js');

(async () => {
    console.log('Initializing Currency...');
    await Currency.get();

    console.log('Initializing Market...');
    await Market.init();

    console.log('Initializing Order books...');
    await OrderBook.init();

    console.log('Initializing Balance...');
    await Balance.init();

    console.log('Initializing Order...');
    await Order.init();

    console.log('Close open Order...');
    await Order.cancelAll();

    setTimeout(() => {
        console.log('Trade all to BTC..');
        for (var i in Config.get('currencies')) {
            var currency = Currency.getBySymbol(Config.get('currencies')[i]);
            var balance = Balance.getByCurrencySymbol(Config.get('currencies')[i]);
            if (balance.getTotal() > 0) {
                var trade = currency.tradeToBtc(balance.getTotal());

                if (trade) {
                    console.log(trade.meetsMinTradeRequirement());
                    console.log(trade.hasBalance());
                    console.log(trade.getQuantity());
                    trade.execute(() => {
                        console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    });
                }
            }
        }
        Order.get();
        setTimeout(() => {
            Util.when(() => {
                console.log('Waiting for orders to fill...');
                Order.get();
                return Order.list.length !== 0;
            }, () => {
                Balance.get();
                setTimeout(() => {
                    var btcQuantity = Balance.getByCurrencySymbol('BTC').getTotal() / Config.get('currencies').length;
                    for (var i in Config.get('currencies')) {
                        var trade = Currency.getBtc().tradeTo(Currency.getBySymbol(Config.get('currencies')[i]), btcQuantity);
                        if (trade) {
                            console.log(trade.meetsMinTradeRequirement());
                            console.log(trade.hasBalance());
                            console.log(trade.getQuantity());
                            trade.execute(() => {
                                console.log('Placed trade ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                            });
                        }
                    }
                }, 2000);
            }, 2000);
        }, 2000);
    }, 2000);
})();