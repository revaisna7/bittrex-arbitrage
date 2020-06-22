var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Currencies = require('./Currencies.js');
var Routes = require('./Routes.js');

module.exports = class Balances {

	static list = [];
	static startList = [];
	static startAccumulate = [];

	static get() {
		bittrex.getbalances(Balances.update);
		setTimeout(Balances.setAccumulateStart, 1000);
	}

	static update(data, err) {
		if (!err) {
			Balances.list = [];
			for (var i in data.result) {
				var balance = new Balance(data.result[i]);
				balance.currency = Currencies.getByCode(data.result[i].Currency);
				if(Balances.startList.length != data.result.length) {
					Balances.startList.push(balance);
				}

				Balances.list.push(balance);
			}
		} else {
			console.log(err);
		}
	}

	static setAccumulateStart() {
		for(var i in Balances.startList) {
			Balances.startAccumulate.push(Balances.accumulate(Balances.startList[i].currency));
		}
	}

	static accumulate(currency) {
		var value = 0;
		for(var i in Balances.list) {
			if(typeof Balances.list[i] == 'object') {
				value += Balances.list[i].currency.convertTo(currency, Balances.list[i].Balance);
			}
		}
		return value;
	}

	static accumulateStart(currency) {
		var value = 0;
		for(var i in Balances.startList) {
			if(typeof Balances.startList[i] == 'object') {
				value += Balances.startList[i].currency.convertTo(currency, Balances.startList[i].Balance);
			}
		}
		return value;
	}

	static getStartByCurrency(currency) {
		for (var i in Balances.startList) {
			if (Balances.startList[i].Currency === currency.Currency) {
				return Balances.startList[i];
			}
		}
	}

	static getByCurrency(currency) {
		for (var i in Balances.list) {
			if (Balances.list[i].Currency === currency.Currency) {
				return Balances.list[i];
			}
		}
	}

}