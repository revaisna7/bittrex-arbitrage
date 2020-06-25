var Config = require('./Config.js');
var Trades = require('./Trades.js');
var Util = require('./Util.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));
module.exports = class Trade {
	constructor(market, outputCurrency, quantity, rate) {

		this.market = market;
		this.outputCurrency = outputCurrency;
		this.quantity = quantity;
		this.rate = rate;
		this.callback = null;

		this.makeRequest();

		this.requested = false;
		this.responded = false;
		this.response = null;

		Trades.push(this);

		return this;
	}

	makeRequest() {
		this.request = {
			MarketName: this.market.MarketName,
			OrderType: 'LIMIT',
			Quantity: Number.parseFloat(this.quantity).toFixed(8),
			Rate: Number.parseFloat(this.rate).toFixed(this.market.getPrecision()),
			TimeInEffect: 'GOOD_TIL_CANCELLED',
			ConditionType: 'NONE',
			Target: 0
		};
	}

	execute(callback) {
		var _this = this;
		this.requested = true;
		this.callbacks = callback;
		if (this.market.isBaseCurrency(this.outputCurrency) && Config.values.speculate) {
			this.request.OrderType += '_SELL';
			bittrex.tradesell(this.request, function(data, err){ _this.tradeCallback(data,err); });
		} else {
			this.request.OrderType += '_BUY';
			bittrex.tradebuy(this.request, function(data, err){ _this.tradeCallback(data,err); });
		}
		this.logData();
		return this;
	}

	deviate(factor) {
		// if(this.market.isBaseCurrency(this.outputCurrency)) {
		// 	this.rate -= this.rate*factor;
		// } else {
		// 	this.rate += this.rate*factor;
		// }
		this.makeRequest();
	}

	tradeCallback(data, err) {
		this.responded = true;
		this.response = data || err;
		this.logData();

		//if(err) throw err;

		if(typeof this.callback === 'function') {
			this.callback(this, data, err);
		}
	}

	logData() {
		this.logFile("\n\n " + (new Date().toLocaleString()));
		this.logFile(JSON.stringify(this.request, null, 2) + "\n");
		this.logFile(JSON.stringify(this.response, null, 2) + "\n");
	}

	logFile(data) {
		fs.appendFile('tradelog', data, function(err) {  if (err) throw err; });
	}

	consoleOutput() {
		return [this.market.MarketName, this.outputCurrency.Currency, Util.pad(this.quantity), Util.pad(this.rate), this.requested, this.responded].join("\t\t");
	}
}