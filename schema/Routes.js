var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Route = require('./Route.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Currency = require('./Currency.js');

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

module.exports = class Routes {

	static list = [];
	static finding = false;
	static find() {
		this.finding = true;
		for (var x in Config.currencies) {
			for (var y in Config.currencies) {
				if (Config.currencies[x] === Config.currencies[y]) {
					continue;
				}
				for (var z in Config.currencies) {
					if (Config.currencies[y] === Config.currencies[z] || Config.currencies[z] === Config.currencies[x]) {
						continue;
					}
					var currencyX = Currencies.getByCode(Config.currencies[x]);
					var currencyY = Currencies.getByCode(Config.currencies[y]);
					var currencyZ = Currencies.getByCode(Config.currencies[z]);
					if(currencyX instanceof Currency && currencyY instanceof Currency && currencyZ instanceof Currency) {
						if (!Routes.routeExists(currencyX, currencyY, currencyZ)) {
							if(currencyX.isAllowed() && currencyY.isAllowed() && currencyZ.isAllowed()) {
								try {
									var route = new Route(currencyX, currencyY, currencyZ);
									if(route) {
										Routes.push(route);
									}
								} catch(e) {
									// route not possible
								}
							}
						}
					}
				}
			}
		}
		this.finding = false;
	}

	static push(route) {
		Routes.list.push(route);
	}

	static routeExists(currencyX, currencyY, currencyZ) {
		for (var i in Routes.list) {
			if (Routes.list[i].currencyX === currencyX
					&& Routes.list[i].currencyY === currencyY
					&& Routes.list[i].currencyZ === currencyZ) {
				return true;
			}
		}
		return false;
	}

	static sortRoutes() {
		Routes.list.sort(Routes.sortComparer);
	}

	static sortComparer(a, b) {
		if (a.profitFactor > b.profitFactor)
			return -1;
		if (a.profitFactor < b.profitFactor)
			return 1;
		return 0;
	}

	static getTradingRoutes() {
		var routes = [];
		for(var i in Routes.list) {
			if(Routes.list[i] instanceof Route) {
				if(Routes.list[i].isTrading()) {
					routes.push(Routes.list[i]);
				}
			}
		}
		return routes;
	}

	static isTrading() {
		return Routes.getTradingRoutes().length > 0;
	}

	static consoleOutput() {
		var output = (" [Triangular Routes]\n");
		Routes.sortRoutes();
		for (var x in Routes.list) {
			if(x == 30) break;
			if(typeof Routes.list[x] == 'object') {
				output += Routes.list[x].consoleOutput() + "\n";
			}
		}
		return output;
	}

}