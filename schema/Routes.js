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

	static find() {
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
									Routes.push(route);
								} catch(e) {
									// route not possible
								}
							}
						}
					}
				}
			}
		}
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

}