var fs = require('fs'),
Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var clear = require('clear');
var Currencies = require('./Currencies.js');
var Balances = require('./Balances.js');
var Markets = require('./Markets.js');
var Routes = require('./Routes.js');
var Trades = require('./Trades.js');
var Orders = require('./Orders.js');

module.exports = class View {
	constructor() {

	}

	static startTime = Date.now();
	static logInterval;

	static start() {
		View.logInterval = setInterval(View.logOutput, 1000/10);
	}

	static stop() {
		clearInterval(logInterval);
	}

	static clearConsole() {
		console.clear();
		clear();
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}

	static title() {
		var timeDiff = Date.now() - View.startTime;
		var hh = Math.floor(timeDiff / 1000 / 60 / 60);
		timeDiff -= hh * 1000 * 60 * 60;
		var mm = Math.floor(timeDiff / 1000 / 60);
		timeDiff -= mm * 1000 * 60;
		var ss = Math.floor(timeDiff / 1000);
		hh = (hh < 10 ? '0' : '') + hh;
		mm = (mm < 10 ? '0' : '') + mm;
		ss = (ss < 10 ? '0' : '') + ss;

		return " [Bittrex Arbitrage] Time Running: " + hh + ":" + mm + ":" + ss + "\n\n";
	}

	static logOutput() {
		View.clearConsole();
		console.log(
			View.title()
		  + Balances.consoleOutput()
		  + (Routes.isTrading() ? Trades.consoleOutput() : Routes.consoleOutput())
		  + Orders.consoleOutput())
		;
	}


}