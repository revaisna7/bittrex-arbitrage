var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var Util = require('./Util.js');
var Currencies = require('./Currencies.js');
var Markets = require('./Markets.js');

module.exports = class Orders {

	static list = [];

	static ordersInterval;

	static getting = false;

	static init() {
		Orders.get();
		Orders.pulse();
	}

	static isGetting() {
		return Orders.getting;
	}

	static get() {
		Orders.getting = true;
		bittrex.getopenorders({}, Orders.update);
	}

	static pulse() {
		Orders.pulseStop();
		Orders.pulseStart();
	}

	static pulseStart() {
		Orders.ordersInterval = setInterval(Orders.get, 1000);
	}

	static pulseStop() {
		clearInterval(Orders.ordersInterval);
	}

	static update(data, err) {
		if (!err) {
			Orders.list = data.result;
		} else {
			Util.logError(err);
		}
	}

	static consoleOutput() {
		var output = "\n\n [Orders]\n Market\t\tType\t\tQuantity\tRemaining\tTarget price\tCurrent price\tDifference";
		for (var i in Orders.list) {
			var order = Orders.list[i];
			if(order) {
				var market = order.Exchange;
				var type = order.OrderType;
				var quantity = order.Quantity;
				var remaining = order.QuantityRemaining;
				var targetPrice = order.Limit;

				var currencies = market.split('-');
				var fromCurrency = type == 'LIMIT_BUY' && !Config.get('speculate') ? Currencies.getByCode(currencies[0]) : Currencies.getByCode(currencies[1]);
				var toCurrency = type == 'LIMIT_BUY' && !Config.get('speculate') ? Currencies.getByCode(currencies[1]) : Currencies.getByCode(currencies[0]);
				var currentPrice = Markets.getByName(market).getPrice(fromCurrency);
				var differenceInValue = type == 'LIMIT_BUY' ? targetPrice-currentPrice : currentPrice-targetPrice;

				output += "\n " + [market,type,Util.pad(quantity),Util.pad(remaining),Util.pad(targetPrice),Util.pad(currentPrice),Util.addPlusOrSpace(differenceInValue,8)].join("\t");
			}
		}
		return output;
	}

}