var Config = require('./Config.js');
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
		return Config.get('restricted').indexOf(this.Currency) > -1;
	}

	isAllowed() {
		return Config.get('currencies').indexOf(this.Currency) > -1;
	}

	getPrecision() {
		return this.Currency === 'USD' || this.Currency === 'EUR' ? 3 : 8;
	}

	convertToBtc(inputQuantity, deviation) {
		return (this === BTC) ? inputQuantity : this.convertTo(BTC, inputQuantity, deviation);
	}

	convertThroughBtc(outputCurrency, inputQuantity, deviation) {
		var marketX = Markets.getByCurrencies(BTC, this);
		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
		if(marketX && marketY) {
			return BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity, deviation), deviation);
		}
		return false;
	}

	convertPotentialThroughBtc(outputCurrency, inputQuantity, deviation) {
		var marketX = Markets.getByCurrencies(BTC, this);
		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
		if(marketX && marketY) {
			return BTC.convertToPotential(outputCurrency, this.convertToBtc(inputQuantity, deviation), deviation);
		}
		return false;
	}

	convertStraight(outputCurrency, inputQuantity, deviation) {
		var market = Markets.getByCurrencies(this, outputCurrency);
		if(market) {
			return market.convert(outputCurrency, inputQuantity, deviation);	
		}
		return false;
	}

	convertPotential(outputCurrency, inputQuantity, deviation) {
		var market = Markets.getByCurrencies(this, outputCurrency);
		if(market) {
			return market.convertPotential(outputCurrency, inputQuantity, deviation);	
		}
		return false;
	}

	convertTo(outputCurrency, inputQuantity, deviation) {
		if(!this.isRestricted() && typeof outputCurrency === 'object') {
			if(this.Currency == outputCurrency.Currency) return inputQuantity;
			var straightConversion = this.convertStraight(outputCurrency, inputQuantity, deviation);
			if(!straightConversion) {
				return this.convertThroughBtc(outputCurrency, inputQuantity, deviation)
			}
			return straightConversion;
		}
		return 0;
	}

	convertToPotential(outputCurrency, inputQuantity, deviation) {
		if(!this.isRestricted() && typeof outputCurrency === 'object') {
			if(this.Currency == outputCurrency.Currency) return inputQuantity;
			var potentialConversion = this.convertPotential(outputCurrency, inputQuantity, deviation);
			if(!potentialConversion) {
				return this.convertPotentialThroughBtc(outputCurrency, inputQuantity, deviation)
			}
			return potentialConversion;
		}
		return 0;
	}

	// tradeTo(outputCurrency, inputQuantity) {
	// 	if(!this.isRestricted() && typeof outputCurrency === 'object') {
	// 		if(this.Currency == outputCurrency.Currency) return;

	// 		// straight trade
	// 		var market = Markets.getByCurrencies(this, outputCurrency);
	// 		if(market) {
	// 			market.trade(outputCurrency, this.convertTo(outputCurrency,inputQuantity), market.getPrice(outputCurrency));	
	// 		}

	// 		// through BTC
	// 		var marketX = Markets.getByCurrencies(BTC, this);
	// 		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
	// 		if(marketX && marketY) {
	// 			marketX.trade(BTC, this.convertTo(BTC,inputQuantity), market.getPrice(BTC));
	// 			marketY.trade(outputCurrency, BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity)), market.getPrice(outputCurrency));
	// 			return BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity));
	// 		}
	// 	}
	// 	return 0;
	// }

}