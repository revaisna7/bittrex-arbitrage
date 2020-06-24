var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Util = require('./Util.js');

module.exports = class Orders {

	static list = [];

	static get() {
		bittrex.getopenorders({}, Orders.update);
	}

	static update(data, err) {
		if (!err) {
			Orders.list = data.result;
		} else {
			throw err;
		}
	}

	static consoleOutput() {
		var output = "\n\n [Orders]\n Market\t\tType\t\tQuantity\tRemaining\tTarget price\tCurrent value\tDifference";
		for (var i in Orders.list) {
			var order = Orders.list;
			if(typeof order == 'object') {
				var market = order.Exchange;
				var type = order.OrderType;
				var quantity = order.Quantity;
				var remaining = order.QuantityRemaining;
				var targetPrice = order.Limit;

				var currencies = market.split('-');
				var fromCurrency = type == 'LIMIT_BUY' ? Currencies.getByCode(currencies[0]) : Currencies.getByCode(currencies[1]);
				var toCurrency = type == 'LIMIT_BUY' ? Currencies.getByCode(currencies[1]) : Currencies.getByCode(currencies[0]);
				var currentValue = fromCurrency.convertTo(toCurrency,remaining);
				var differenceInValue = currentValue-remaining-currentValue;

				output += "\n " + [market,type,pad(quantity),pad(remaining),pad(targetPrice),pad(currentValue),addPlusOrSpace(differenceInValue,8)].join("\t");
			}
		}
		return output;
	}

}