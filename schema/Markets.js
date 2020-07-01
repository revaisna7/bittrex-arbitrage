var Config = require('./Config.js');
var Bittrex = require('../bittrex/Bittrex.js');
var Market = require('./Market.js');

module.exports = class Markets {

    static list = [];

    static async init() {
        return await Markets.get();
    }

    static async get() {
        let markets = await Bittrex.markets();
        for (var i in markets) {
            if (!Markets.getBySymbol(markets.symbol)) {
                Markets.push(new Market(markets[i]));
            }
        }
    }

    static push(market) {
        Markets.list.push(market);
    }

    static subscribeOrderBooks() {
        Markets.startOrderBooksUpdates();
        Markets.subscribeSockets();
    }

    static getUsedMarkets() {
        var markets = [];
        for (var i in Markets.list) {
            if (Markets.list[i].canTrade()) {
                markets.push(Markets.list[i]);
            }
        }
        return markets;
    }

    static getUsedMarketSymbols() {
        var marketSymbols = [];
        var markets = Markets.getUsedMarkets();
        for (var i in markets) {
            marketSymbols.push(markets[i].symbol);
        }
        return marketSymbols;
    }

    static getBySymbol(marketName) {
        for (var i in Markets.list) {
            if (Markets.list[i].symbol === marketName) {
                return Markets.list[i];
            }
        }
    }

    static getByCurrencies(currencyX, currencyY) {
        for (var i in Markets.list) {
            if ( Markets.list[i].symbol === currencyX.symbol + '-' + currencyY.symbol
              || Markets.list[i].symbol === currencyY.symbol + '-' + currencyX.symbol) {
                return Markets.list[i];
            }
        }
        return null;
    }
}