var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var Currency = require('./Currency.js');
var Util = require('./Util.js');

module.exports = class Currencies {

	static list = [];

	static BTC;

	static get() {
		bittrex.getcurrencies(Currencies.update);
	}

	static update (data, err) {
		if(data) {
			for(var i in data.result) {
				var currency = new Currency(data.result[i]);
				Currencies.push(currency);
				if(currency.Currency === 'BTC') {
					Currencies.BTC = currency;
				}
			}
		}
		if(err) {
			Util.logError(err);
		}
	}

	static getBtc() {
		return Currencies.BTC;
	}

	static push(currency) {
		Currencies.list.push(currency);
	}

	static getByCode(currencyCode) {
		for (var i in Currencies.list) {
			if (Currencies.list[i].Currency === currencyCode) {
				return Currencies.list[i];
			}
		}
		return null;
	}

}