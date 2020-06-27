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

	convertToBtc(inputQuantity, priceDeviation) {
		return (this === BTC) ? inputQuantity : this.convertTo(BTC, inputQuantity, priceDeviation);
	}

	convertToPotentialBtc(inputQuantity, priceDeviation) {
		return (this === BTC) ? inputQuantity : this.convertToPotential(BTC, inputQuantity, priceDeviation);
	}

	convertThroughBtc(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var marketX = Markets.getByCurrencies(BTC, this);
		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
		if(marketX && marketY) {
			return BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity, priceDeviation), priceDeviation);
		}
		return 0;
	}

	convertPotentialThroughBtc(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var marketX = Markets.getByCurrencies(BTC, this);
		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
		if(marketX && marketY) {
			return BTC.convertToPotential(outputCurrency, this.convertToBtc(inputQuantity, priceDeviation), priceDeviation);
		}
		return 0;
	}

	convertStraight(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var market = Markets.getByCurrencies(this, outputCurrency);
		if(market) {
			return market.convert(outputCurrency, inputQuantity, priceDeviation);	
		}
		return 0;
	}

	convertPotential(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var market = Markets.getByCurrencies(this, outputCurrency);
		if(market) {
			return market.convertPotential(outputCurrency, inputQuantity, priceDeviation);	
		}
		return 0;
	}

	convertTo(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var straightConversion = this.convertStraight(outputCurrency, inputQuantity, priceDeviation);
		if(!straightConversion) {
			return this.convertThroughBtc(outputCurrency, inputQuantity, priceDeviation)
		}
		return straightConversion;
	}

	convertToPotential(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return inputQuantity;
		var potentialConversion = this.convertPotential(outputCurrency, inputQuantity, priceDeviation);
		if(!potentialConversion) {
			return this.convertPotentialThroughBtc(outputCurrency, inputQuantity, priceDeviation)
		}
		return potentialConversion;
	}

	tradeToBtc(inputQuantity, priceDeviation) {
		return (this === BTC) ? inputQuantity : this.tradeTo(BTC, inputQuantity, priceDeviation);
	}

	tradeThroughBtc(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return;
		var marketX = Markets.getByCurrencies(BTC, this);
		var marketY = Markets.getByCurrencies(BTC, outputCurrency);
		if(marketX && marketY) {
			return BTC.tradeTo(outputCurrency, this.tradeToBtc(inputQuantity, priceDeviation), priceDeviation);
		}
	}

	tradeStraight(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return;
		var market = Markets.getByCurrencies(this, outputCurrency);
		if(market) {
			return market.trade(outputCurrency, inputQuantity, priceDeviation);	
		}
	}

	tradeTo(outputCurrency, inputQuantity, priceDeviation) {
		if(this.Currency === outputCurrency.Currency) return;
		var straightTrade = this.tradeStraight(outputCurrency, inputQuantity, priceDeviation);
		if(!straightTrade) {
			return this.tradeThroughBtc(outputCurrency, inputQuantity, priceDeviation)
		}
		return straightTrade;
	}

}