var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Route = require('./Route.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Currency = require('./Currency.js');

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
					if (!Routes.routeExists(Config.currencies[x],Config.currencies[y],Config.currencies[z])) {
						var route = Route.find(Config.currencies[x],Config.currencies[y],Config.currencies[z]);
						if(route) {
							Routes.push(route);
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
		var output = ("\n\n [Triangular Routes]\n");
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