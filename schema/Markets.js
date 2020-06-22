var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

const Market = require('./Market.js');

module.exports = class Markets {

	static list = [];
	static socket;

	static push(market) {
		Markets.list.push(market);
	}

	static getSummaries() {
		bittrex.getmarketsummaries(Markets.updateSummaries);
	}

	static updateSummaries(data, err) {
		if (err) {
			console.log('!!!! Error: ' + err.message);
			return;
		}
		for (var i in data.result) {
			if(data.result[i].MarketName) {
				var market = new Market(data.result[i]);
				Markets.push(market);
				market.getOrderBook();
			}
		}
	}

	static getUsedMarketNames() {
		var marketNames = [];
		for(var i in Markets.list) {
			if(Markets.list[i] instanceof Market
				&& Markets.list[i].isAllowed()) {
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
			if (Markets.list[i].MarketName === currencyX.Currency + '-' + currencyY.Currency
				|| Markets.list[i].MarketName === currencyY.Currency + '-' + currencyX.Currency) {
				return Markets.list[i];
			}
		}
		return null;
	}

	static getBtcMarket(currency) {
		return Markets.getByCurrencies(Currecies.getBtc(), currency);
	}
}