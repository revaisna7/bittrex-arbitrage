var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var Market = require('./Market.js');
var Util = require('./Util.js');

module.exports = class Markets {

	static list = [];
	static socket;
	static orderBookUpdateIndex = 0;
	static orderBookUpdateInterval = 0;

	static push(market) {
		Markets.list.push(market);
	}

	static getSummaries() {
		bittrex.getmarkets(Markets.updateMarkets);
	}

	static updateMarkets(data, err) {
		if(data) {
			for (var i in data.result) {
				if(data.result[i].MarketName) {
					var market = new Market(data.result[i]);
					Markets.push(market);
				}
			}
		}
		if (err) {
			Util.logError(err);
		}
	}

	static startOrderBooksUpdates() {
		Markets.orderBookUpdateInterval = setInterval(Markets.getNextOrderBook, 100);
	}

	static stopOrderBooksUpdates() {
		clearInterval(Markets.orderBookUpdateInterval);
	}

	static getNextOrderBook() {
		var usedMarkets = Markets.getUsedMarkets();
		if(Markets.orderBookUpdateIndex >= usedMarkets.length) {
			Markets.orderBookUpdateIndex = 0;
		}
		usedMarkets[Markets.orderBookUpdateIndex].getOrderBook();
		Markets.orderBookUpdateIndex++;
	}

	static getUsedMarkets() {
		var markets = [];
		for(var i in Markets.list) {
			if(Markets.list[i] instanceof Market && Markets.list[i].isAllowed() && !Markets.list[i].IsRestricted) {
				markets.push(Markets.list[i]);
			}
		}
		return markets;
	}


	static getUsedMarketNames() {
		var marketNames = [];
		for(var i in Markets.list) {
			if(Markets.list[i] instanceof Market && Markets.list[i].isAllowed() && !Markets.list[i].IsRestricted) {
				marketNames.push(Markets.list[i].MarketName);
			}
		}
		return marketNames;
	}

	static subscribe() {
		Markets.socket = bittrex.websockets.subscribe(Markets.getUsedMarketNames(), function(data) {
			if (data.M === 'updateExchangeState') {
				data.A.forEach(function(data_for) {
					Markets.getByName(data_for.MarketName).updateExchangeState(data_for);
				});
			}
		});
	}

	static getByName(marketName) {
		for (var i in Markets.list) {
			if (Markets.list[i].MarketName === marketName) {
				return Markets.list[i];
			}
		}
	}

	static getByCurrencies(currencyX, currencyY) {
		for (var i in Markets.list) {
			if (Markets.list[i].MarketName === currencyX.Currency + '-' + currencyY.Currency || Markets.list[i].MarketName === currencyY.Currency + '-' + currencyX.Currency) {
				return Markets.list[i];
			}
		}
		return null;
	}

	static getBtcMarket(currency) {
		return Markets.getByCurrencies(Currecies.getBtc(), currency);
	}
}