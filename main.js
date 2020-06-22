console.log('Initiating...');

var fs = require('fs');
console.log('Bittrex Arbitrage init....');
var Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var clear = require('clear');
var process = require('process');
var Markets = require('./schema/Markets.js');
var Routes = require('./schema/Routes.js');
var Currencies = require('./schema/Currencies.js');
var Balances = require('./schema/Balances.js');
var startTime = Date.now();
var bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

global.calledTrades = 0;





var logInterval;
var balanceInterval = setInterval(Balances.get, 10000);

setTimeout(function(){
	console.log('Get currencies...');
	Currencies.get();
	setTimeout(function(){
		console.log('Get markets...');
		Markets.getSummaries();
		setTimeout(function(){
			console.log('Subscribe markets...');
			Markets.subscribe();
			setTimeout(function(){
				console.log('Get balances...');
				Balances.get();	
				setTimeout(function(){
					console.log('Find routes...');
					Routes.find();
					setTimeout(function(){
						logInterval = setInterval(log, 1000/3);
					},1000);
				},1000);
			},1000);
		},1000);
	},1000);
},1000);

String.prototype.addPlusOrSpace = function(number, decimals) {
	decimals = decimals || 4;
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
	if (number < 100 && number > -100) {
		str += '0';
	}
	return str + number.toFixed(decimals).replace('-', '') + "\x1b[0m";
}

String.prototype.pad = function(n, z, l) {
	z = z || ' ';
	n = n + '';
	l = l || 14;
	return n.length >= l ? n : new Array(l - n.length + 1).join(z) + n;
}

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

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

var orders = [];

function log() {
	var output = '';
	var totalsOutput = '';
	var balancesOutput = '';
	var totalProfitFactor = 0;
	var BTC = Currencies.getBtc();

	for (var i in Balances.list) {
		var balance = Balances.list[i];
		var currency = Currencies.getByCode(balance.Currency);
		var startBalance = Balances.getStartByCurrency(currency);
		var btcTotalNow = 0;
		if(balance && currency && startBalance && currency.isAllowed()) {
			var start = startBalance.Balance;
			var now = balance.Balance;
			var profit = now - start;
			var profitFactor = (profit / start * 100);

			var btcStart = currency.convertTo(BTC, start);
			var btcNow = currency.convertTo(BTC, now);
			var btcProfit = btcNow - btcStart;
			var btcProfitFactor = btcProfit / btcStart * 100;
			btcTotalNow += btcNow;
			balancesOutput += ("[" + currency.Currency + "]"
				+ "\t\t" + pad(start.toFixed(8))
				+ "\t" + pad(now.toFixed(8))
				+ "\t" + pad(Balances.accumulateStart(currency).toFixed(8))
				+ "\t" + pad(Balances.accumulate(currency).toFixed(8))
				+ "\t" + addPlusOrSpace(profit,8)
				+ "\t\t" + addPlusOrSpace(profitFactor) + '%'
				+ "\t" + pad(btcNow.toFixed(8))
				+ "\t\t" + addPlusOrSpace(btcProfit,8)
				+ "\t\t" + addPlusOrSpace(btcProfitFactor)+ '%' + "\n");
		}
	}

	output += ("\n\n" + 'Bittrex Arbitrage')
	var timeDiff = Date.now() - startTime;
	var hh = Math.floor(timeDiff / 1000 / 60 / 60);
	timeDiff -= hh * 1000 * 60 * 60;
	var mm = Math.floor(timeDiff / 1000 / 60);
	timeDiff -= mm * 1000 * 60;
	var ss = Math.floor(timeDiff / 1000);
	hh = (hh < 10 ? '0' : '') + hh;
	mm = (mm < 10 ? '0' : '') + mm;
	ss = (ss < 10 ? '0' : '') + ss;

	output += ("Time Running: " + hh + ":" + mm + ":" + ss + "\n\n");
	output += ("[Currency]\tStart\t\tNow\t\tTotal Start\tTotal Now\tProfit\t\tProfit Factor\tCurrent BTC Value\tCurrency BTC Profit\tCurrency BTC Profit Factor\n");
	output += (balancesOutput + "\n");
	// output += ("\n" + totalsOutput + "\n");
	output += ("Market conflicts:\n\n");
	for (var x in Routes.list) {
		if(typeof Routes.list[x] == 'object') {
			output += Routes.list[x].generateOutput() + "\n";
		}
	}
	// output += ((logSpinner === 0 ? '\\' : logSpinner === 1 ? '-' : '/'));
	// logSpinner++;
	try {
	    process.stdout.clearLine();
	    process.stdout.cursorTo(0);
		clear();
	} catch (e) {
	}
	console.clear();
	console.log(output);

	// console.log("\nOrders\n");

	// console.log("Market\t\tType\t\tQuantity\tRemaining\tTarget price\tCurrent price\tDifference\tPercentage")
	// for (var i in orders) {
	// 	var market = 0;//getMarketByName(orders[i].Exchange);
	// 	var orderCurrencyNames = orders[i].Exchange.split('-');
	// 	var currencyName = orders[i].OrderType === 'LIMIT_BUY' ? orderCurrencyNames[0] : orderCurrencyNames[1];
	// 	var currencyYName = orders[i].OrderType === 'LIMIT_BUY' ? orderCurrencyNames[1] : orderCurrencyNames[0];
	// 	var currency = 0;//getCurrencyByName(currencyName);
	// 	var currencyY = 0;//getCurrencyByName(currencyYName);
	// 	var isBase = 0;//isBaseCurrency(currencyName, market);
	// 	var modifyPrice = 0;//getMarketPrice(isBaseCurrency(currencyYName, market), market, currencyY, true);
	// 	var difference = 0;//(orders[i].OrderType === 'LIMIT_BUY' ? orders[i].Limit - modifyPrice : modifyPrice - orders[i].Limit);
	// 	var differencePercentage = 0;//(difference / orders[i].Limit) * 100;

	// 	console.log(orders[i].Exchange
	// 		+ " \t" + orders[i].OrderType
	// 		+ " \t" + pad(orders[i].Quantity.toFixed(8))
	// 		+ " \t" + pad(orders[i].QuantityRemaining.toFixed(8))
	// 		+ " \t" + pad(orders[i].Limit.toFixed(8))
	// 		+ " \t" + modifyPrice
	// 		+ " \t" + addPlusOrSpace(difference)
	// 		+ " \t" + addPlusOrSpace(differencePercentage) + "%");
	// }
}



function checkOrders() {
	bittrex.getopenorders({}, function (data, err) {
		if (!err) {
			pendingOrders = data.result.length;
			orders = data.result;
			orders.sort(compare);
		}
	});
}

var checkOrderInterval = setInterval(checkOrders, 10000);

function updateBalances() {
	bittrex.getbalances(function (data, err) {
		if (!err) {
			balances = data.result;
		}
	});
}


function compare(a, b) {
	if (a.Opened < b.Opened)
		return -1;
	if (a.Opened > b.Opened)
		return 1;
	return 0;
}

