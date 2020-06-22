var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Markets = require('./Markets.js');

var BTC;

module.exports = class Currency {

	constructor(currency) {
		Object.assign(this, currency);

		if(this.Currency == 'BTC') {
			BTC = this;
		}

		return this;
	}

	isRestricted() {
		return Config.restricted.indexOf(this.Currency) > -1;
	}

	isAllowed() {
		return Config.currencies.indexOf(this.Currency) > -1;
	}

	getPrecision() {
		return this.Currency === 'USD' || this.Currency === 'EUR' ? 3 : 8;
	}

	convertToBtc(inputQuantity) {
		return this.convertTo(BTC, inputQuantity);
	}

	convertTo(outputCurrency, inputQuantity) {
		if(!this.isRestricted() && typeof outputCurrency === 'object') {
			if(this.Currency == outputCurrency.Currency) return inputQuantity;

			// straight conversion
			var market = Markets.getByCurrencies(this, outputCurrency);
			if(market) {
				return market.convert(outputCurrency, inputQuantity);	
			}

			// through BTC
			var marketX = Markets.getByCurrencies(BTC, this);
			var marketY = Markets.getByCurrencies(BTC, outputCurrency);
			if(marketX && marketY) {
				return BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity));
			}
		}
		return 0;
	}

	tradeTo(outputCurrency, inputQuantity) {
		if(!this.isRestricted() && typeof outputCurrency === 'object') {
			if(this.Currency == outputCurrency.Currency) return;

			// straight trade
			var market = Markets.getByCurrencies(this, outputCurrency);
			if(market) {
				market.trade(outputCurrency, this.convertTo(outputCurrency,inputQuantity), market.getPrice(outputCurrency));	
			}

			// through BTC
			var marketX = Markets.getByCurrencies(BTC, this);
			var marketY = Markets.getByCurrencies(BTC, outputCurrency);
			if(marketX && marketY) {
				marketX.trade(BTC, this.convertTo(BTC,inputQuantity), market.getPrice(BTC));
				marketY.trade(outputCurrency, BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity)), market.getPrice(outputCurrency));
				return BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity));
			}
		}
		return 0;
	}

}