var Model = require('../../system/Model.js');


module.exports = class Account extends Model {

    static initialized = false;

    static async start() {
        if(Arbitrage.initialized === false) {
            Arbitrage.initialized = true;
            console.log('Initializing Arbitrages...');

            await Arbitrage.Currency.init();
            await Arbitrage.Market.init();
            await Arbitrage.OrderBook.init();
            await Arbitrage.Balance.init();
            await Arbitrage.Order.init();

            setTimeout(() => {
                console.log('Initializing Routes...');
                Arbitrage.Route.init();
            }, 5000);
        }
    }

    static consoleOutput() {
        return Arbitrage.Route.consoleOutput()
            + Arbitrage.Balance.consoleOutput()
            + Arbitrage.Trade.consoleOutput()
            + Arbitrage.Order.consoleOutput();
    }

    static stop() {
        // todo
    }

};