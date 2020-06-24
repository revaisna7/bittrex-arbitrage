var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Currency = require('./Currency.js');

module.exports = class Currencies {

	static list = [];

	static get() {
		bittrex.getcurrencies(Currencies.update);
	}

	static update (data, err) {
		if (err) {
			console.log('!!!! Error: ' + err.message);
			return;
		}
		for(var i in data.result) {
			Currencies.list.push(new Currency(data.result[i]));
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