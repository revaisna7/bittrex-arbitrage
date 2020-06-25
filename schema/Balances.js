var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Currencies = require('./Currencies.js');
var Routes = require('./Routes.js');
var Util = require('./Util.js');

module.exports = class Balances {

	static list = [];
	static startList = [];
	static startAccumulate = [];
	static balancesInterval;

	static getting = false;

	static init() {
		Balances.get();
		setTimeout(Balances.setAccumulateStart, 1000);
		Balances.pulse();
	}

	static isGetting() {
		return Balances.getting;
	}

	static get() {
		Balances.getting = true;
		bittrex.getbalances(Balances.update);
	}

	static pulse() {
		Balances.pulseStop();
		Balances.pulseStart();
	}

	static pulseStart() {
		Balances.balancesInterval = setInterval(Balances.get, 1000);
	}

	static pulseStop() {
		clearInterval(Balances.balancesInterval);
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
			Util.logError(err);
		}
		Balances.getting = false;
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

	static consoleOutput() {
		var output =  (" [Balances]\n Currency\tBalance\t\tTotal\t\tStart\t\tProfit\t\tFactor\t\tBTC balance\tBTC value\tBTC start\tBTC Profit\tBTC factor\n");
		for (var i in Balances.list) {
			var balance = Balances.list[i];
			var currency = Currencies.getByCode(balance.Currency);
			var startBalance = Balances.getStartByCurrency(currency);
			if(balance && currency && startBalance && currency.isAllowed()) {
				var accumulateStart = Balances.startAccumulate[i];
				var accumulateNow = Balances.accumulate(currency);
				var accimulateProfitNow = accumulateNow - accumulateStart;

				var profit = accumulateStart - accumulateNow;
				var profitFactor = (profit / accumulateStart * 100);

				var btcStart = currency.convertToBtc(accumulateStart);
				var btcBalance = currency.convertToBtc(balance.Balance);
				var btcNow = currency.convertToBtc(accumulateNow);
				var btcProfit = btcStart - btcNow;
				var btcProfitFactor = btcProfit / btcStart * 100;

				output += [" [" + currency.Currency + "]\t"
					,Util.pad(balance.Balance)
					,Util.pad(accumulateNow)
					,Util.pad(accumulateStart)
					,Util.addPlusOrSpace(profit,8)
					,Util.addPlusOrSpace(profitFactor) + '%'
					,Util.pad(btcBalance)
					,Util.pad(btcNow)
					,Util.pad(btcStart)
					,Util.addPlusOrSpace(btcProfit,8)
					,Util.addPlusOrSpace(btcProfitFactor) + '%'
					].join("\t")
				 + "\n"
				;
			}
		}
		return output;
	}

}