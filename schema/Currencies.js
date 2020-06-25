var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var Currency = require('./Currency.js');
var Util = require('./Util.js');

module.exports = class Currencies {

	static list = [];

	static get() {
		bittrex.getcurrencies(Currencies.update);
	}

	static update (data, err) {
		if(data) {
			for(var i in data.result) {
				Currencies.list.push(new Currency(data.result[i]));
			}
		}
		if(err) {
			Util.logError(err);
		}
	}

	static getBtc() {
		return Currencies.getByCode('BTC');
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