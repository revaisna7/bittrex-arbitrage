var Model = require('../../system/Model.js');


module.exports = class Arbitrage extends Model {

    static Currency = require('./Currency.js');
    static Market = require('./Market.js');
    static OrderBook = require('./OrderBook.js');
    static Balance = require('./Balance.js');
    static Route = require('./Route.js');

    static async start() {
        console.log('Initializing Arbitrages...');
        
        await Arbitrage.Currency.init();
        await Arbitrage.Market.init();
        await Arbitrage.OrderBook.init();
        await Arbitrage.Balance.init();

        setTimeout(() => {
            console.log('Initializing Routes...');
            Arbitrage.Route.init();
        }, 5000);

    }

    static stop() {
        // todo
    }

};