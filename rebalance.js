console.log('Initiating...');
var Config = require('./schema/Config.js');
Config.init();

var Markets = require('./schema/Markets.js');
var OrderBook = require('./schema/OrderBook.js');
var Currencies = require('./schema/Currencies.js');
var Balances = require('./schema/Balances.js');
var Orders = require('./schema/Orders.js');
var Util = require('./schema/Util.js');
var Trade = require('./schema/Trade.js');

(async () => {
    console.log('Initializing Currencies...');
    await Currencies.get();

    console.log('Initializing Markets...');
    await Markets.init();

    console.log('Initializing Order books...');
    await OrderBook.init();

    console.log('Initializing Balances...');
    await Balances.init();

    console.log('Initializing Orders...');
    await Orders.init();

    console.log('Close open orders...');
    await Orders.cancelAll();

    setTimeout(() => {
        console.log('Trade all to BTC..');
        for (var i in Config.get('currencies')) {
            var currency = Currencies.getBySymbol(Config.get('currencies')[i]);
            var balance = Balances.getByCurrencySymbol(Config.get('currencies')[i]);
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
        Orders.get();
        setTimeout(() => {
            Util.when(() => {
                console.log('Waiting for orders to fill...');
                Orders.get();
                return Orders.list.length !== 0;
            }, () => {
                Balances.get();
                setTimeout(() => {
                    var btcQuantity = Balances.getByCurrencySymbol('BTC').getTotal() / Config.get('currencies').length;
                    for (var i in Config.get('currencies')) {
                        var trade = Currencies.getBtc().tradeTo(Currencies.getBySymbol(Config.get('currencies')[i]), btcQuantity);
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