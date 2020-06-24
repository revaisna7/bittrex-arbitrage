var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')) ,
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Trades = require('./Trades.js');

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
		if (this.market.isBaseCurrency(this.outputCurrency)) {
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
		// if(factor !== 0) {
		// 	if(this.market.isBaseCurrency(this.outputCurrency)) {
		// 		this.rate += this.rate/factor;
		// 		this.quantity = this.quantity*factor;
		// 	} else {
		// 		this.rate = this.rate*factor;
		// 		this.quantity = this.quantity/factor;
		// 	}
		// 	this.makeRequest();
		// }
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
		this.logFile(JSON.stringify(this.request, null, 2));
		this.logFile(JSON.stringify(this.response, null, 2));
	}

	logFile(data) {
		fs.appendFile('tradelog', data, function(err) {  if (err) throw err; });
	}

	consoleOutput() {
		return [this.market, this.outputCurrency.Currency, this.quantity, this.rate, this.requested, this.responded].join("\t");
	}
}