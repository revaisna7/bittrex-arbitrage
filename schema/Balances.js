var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Currencies = require('./Currencies.js');
var Routes = require('./Routes.js');

var addPlusOrSpace = function(number, decimals) {
	var decimals = decimals || 3;
	var number = Number.parseFloat(number);
	var str = '';
	if (number === 0) {
		str += ' ';
	}
	if (number < 0) {
		str += "\x1b[31m";
		str += '-';
	}
	if (number > 0) {
		str += "\x1b[32m";
		str += '+';
	}
	if (number < 10 && number > -10) {
		str += '0';
	}
	return str + number.toFixed(decimals).replace('-', '') + "\x1b[0m";
}
var pad = function(number, decimals) {
	var number = Number.parseFloat(number);
	var decimals = decimals || 8;
	var str = '';
	if (number < 10 && number > -10) {
		str += ' ';
	}
	if (number < 100 && number > -100) {
		str += ' ';
	}
	if (number < 1000 && number > -1000) {
		str += ' ';
	}
	return str + number.toFixed(decimals);
}

module.exports = class Balances {

	static list = [];
	static startList = [];
	static startAccumulate = [];
	static balancesInterval;

	static init() {
		Balances.get();
		setTimeout(Balances.setAccumulateStart, 1000);
		Balances.pulse();
	}

	static get() {
		bittrex.getbalances(Balances.update);
	}

	static pulse() {
		Balances.pulseStart();
		Balances.pulseStop();
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

	static consoleOutput() {
		var output =  (" [Currency]\tStart\t\tNow\t\tProfit\t\tTotal Start\tTotal Now\tTotal Profit Now\tProfit Factor\tCurrent BTC Value\tCurrency BTC Profit\tCurrency BTC Profit Factor\n");
		for (var i in Balances.list) {
			var balance = Balances.list[i];
			var currency = Currencies.getByCode(balance.Currency);
			var startBalance = Balances.getStartByCurrency(currency);
			if(balance && currency && startBalance && currency.isAllowed()) {
				var start = startBalance.Balance;
				var now = balance.Balance;
				var profit = now - start;
				var profitFactor = (profit / start * 100);

				var btcStart = currency.convertToBtc(start);
				var btcNow = currency.convertToBtc(now);
				var btcProfit = btcNow - btcStart;
				var btcProfitFactor = btcProfit / btcStart * 100;

				var accumulateStart = Balances.startAccumulate[i];
				var accumulateNow = Balances.accumulate(currency);
				var accimulateProfitNow = accumulateNow - accumulateStart;

				output += (" [" + currency.Currency + "]"
					+ "\t\t" + pad(start.toFixed(8))
					+ "\t" + pad(now.toFixed(8))
					+ "\t" + addPlusOrSpace(profit,8)
					+ "\t" + pad(accumulateStart.toFixed(8))
					+ "\t" + pad(accumulateNow.toFixed(8))
					+ "\t" + addPlusOrSpace(accimulateProfitNow.toFixed(8), 8)
					+ "\t\t" + addPlusOrSpace(profitFactor) + '%'
					+ "\t" + pad(btcNow.toFixed(8))
					+ "\t\t" + addPlusOrSpace(btcProfit,8)
					+ "\t\t" + addPlusOrSpace(btcProfitFactor)+ '%' + "\n");
			}
		}
		return output;
	}

}