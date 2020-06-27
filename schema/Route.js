var Config = require('./Config.js');
var Markets = require('./Markets.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Currency = require('./Currency.js');
var Trade = require('./Trade.js');
var Util = require('./Util.js');

global.trading = false;

/**
 * Route logic
 */
 module.exports = class Route {

 	constructor(currencyX, currencyY, currencyZ) {
 		this.currencyX = currencyX;
 		this.currencyY = currencyY;
 		this.currencyZ = currencyZ;

 		this.getMarkets();

 		if(this.isRestricted()) {
 			return false;
 		}

 		this.isXBase = this.marketX.BaseCurrencyCode == this.currencyX.Currency;
 		this.isYBase = this.marketY.BaseCurrencyCode == this.currencyY.Currency;
 		this.isZBase = this.marketZ.BaseCurrencyCode == this.currencyZ.Currency;

		this.marketXMarketCurrency = Currencies.getByCode(this.marketX.MarketCurrency);
 		this.marketYMarketCurrency = Currencies.getByCode(this.marketY.MarketCurrency);
 		this.marketZMarketCurrency = Currencies.getByCode(this.marketZ.MarketCurrency);

 		this.tradeX = null;
 		this.tradeY = null;
 		this.tradeZ = null;

 		this.profitFactor = 0;
 	}

 	getMarkets() {
 		this.marketX = Markets.getByCurrencies(this.currencyX,this.currencyY);
 		this.marketY = Markets.getByCurrencies(this.currencyY,this.currencyZ);
 		this.marketZ = Markets.getByCurrencies(this.currencyZ,this.currencyX);

 		if(this.marketX === null || this.marketY === null || this.marketZ === null) {
 			throw 'Not all markets exist';
 		}

 		this.marketX.routes.push(this);
 		this.marketY.routes.push(this);
 		this.marketZ.routes.push(this);
 	}

 	getBalances() {
 		var b;
 		this.balanceX = (b = Balances.getByCurrency(this.currencyX)) ? b.Available : 0;
 		this.balanceY = (b = Balances.getByCurrency(this.currencyY)) ? b.Available : 0;
 		this.balanceZ = (b = Balances.getByCurrency(this.currencyZ)) ? b.Available : 0;
 	}

 	getInputs() {
 		this.getBalances();
 		var priceDeviation = Config.get('priceDeviation') || 0;
 		var speculate = Config.get('speculate');

 		this.currencyXBtcBalance = this.currencyX.convertToBtc(this.balanceX);
 		this.currencyYBtcBalance = this.currencyY.convertToBtc(this.balanceY);
 		this.currencyZBtcBalance = this.currencyZ.convertToBtc(this.balanceZ);

 		this.minBtcMarketX = this.marketXMarketCurrency.convertToBtc(this.marketX.MinTradeSize);
 		this.minBtcMarketY = this.marketYMarketCurrency.convertToBtc(this.marketY.MinTradeSize);
 		this.minBtcMarketZ = this.marketZMarketCurrency.convertToBtc(this.marketZ.MinTradeSize);

 		this.minBtcBalance = Math.min(this.currencyXBtcBalance,this.currencyYBtcBalance,this.currencyZBtcBalance);
 		this.minBtcMarket = Math.max(this.minBtcMarketX,this.minBtcMarketY,this.minBtcMarketZ);

 		this.inputBtc = Math.max(Config.get('minInputBtc'), this.minBtcMarket, this.minBtcBalance, this.minBtcMarket);

 		this.inputX = Currencies.getBtc().convertTo(this.currencyX, this.inputBtc);
 		this.inputY = Currencies.getBtc().convertTo(this.currencyY, this.inputBtc);
 		this.inputZ = Currencies.getBtc().convertTo(this.currencyZ, this.inputBtc);
 		// get outputs on minimum amounts
 		this.getOuputs();

 		// get available quantities at caluclated rates
		this.marketXBtcQuantity = this.currencyX.convertToBtc(speculate ? this.marketX.getPotentialQuantity(this.currencyY,this.priceX) : this.marketX.getQuantity(this.currencyY,this.priceX));
 		this.marketYBtcQuantity = this.currencyY.convertToBtc(speculate ? this.marketY.getPotentialQuantity(this.currencyZ,this.priceY) : this.marketY.getQuantity(this.currencyZ,this.priceY));
 		this.marketZBtcQuantity = this.currencyZ.convertToBtc(speculate ? this.marketZ.getPotentialQuantity(this.currencyX,this.priceZ) : this.marketZ.getQuantity(this.currencyX,this.priceZ));
 	
  		this.inputBtc = Math.min(Config.get('maxInputBtc'), Math.max(Config.get('minInputBtc'), this.marketXBtcQuantity, this.marketYBtcQuantity, this.marketZBtcQuantity))*(1-Config.get('dust'));

 		this.inputX = Currencies.getBtc().convertTo(this.currencyX, this.inputBtc);
 		this.inputY = Currencies.getBtc().convertTo(this.currencyY, this.inputBtc);
 		this.inputZ = Currencies.getBtc().convertTo(this.currencyZ, this.inputBtc);

 		// get final outputs
 		this.getOuputs();
  	}

 	getOuputs() {
 		var priceDeviation = Config.get('priceDeviation') || 0;
 		var speculate = Config.get('speculate');
 		this.outputX = speculate ? this.currencyX.convertToPotential(this.currencyY, this.inputX, priceDeviation) : this.currencyX.convertTo(this.currencyY, this.inputX, priceDeviation);
 		this.outputY = speculate ? this.currencyY.convertToPotential(this.currencyZ, this.inputY, priceDeviation) : this.currencyY.convertTo(this.currencyZ, this.inputY, priceDeviation);
 		this.outputZ = speculate ? this.currencyZ.convertToPotential(this.currencyX, this.inputZ, priceDeviation) : this.currencyZ.convertTo(this.currencyX, this.inputZ, priceDeviation);
 	
		this.priceX = Config.get('speculate') ? this.marketX.getPotentialPrice(this.currencyY, priceDeviation) : this.marketX.getPrice(this.currencyY, priceDeviation);
		this.priceY = Config.get('speculate') ? this.marketY.getPotentialPrice(this.currencyZ, priceDeviation) : this.marketY.getPrice(this.currencyZ, priceDeviation);
		this.priceZ = Config.get('speculate') ? this.marketZ.getPotentialPrice(this.currencyX, priceDeviation) : this.marketZ.getPrice(this.currencyX, priceDeviation);
 	}

 	isRestricted() {
 		return Config.get('restricted').includes(this.currencyX.Currency)
 		|| Config.get('restricted').includes(this.currencyY.Currency)
 		|| Config.get('restricted').includes(this.currencyZ.Currency)
 		|| this.marketX.IsRestricted
 		|| this.marketY.IsRestricted
 		|| this.marketZ.IsRestricted;
 	}

 	calculate() {
 		this.getInputs();
 		this.getOuputs();
 		this.calculateProfit();

 		if(this.isProfitable() && this.hasEnoughBalance() && !this.isTrading()) {
 			this.trade();
 		}
 	}

 	calculateProfit() {
 		this.profitFactorX = (this.outputZ-this.inputX) / this.inputX * 100;
 		this.profitFactorY = (this.outputX-this.inputY) / this.inputY * 100;
 		this.profitFactorZ = (this.outputY-this.inputZ)  / this.inputZ * 100;
 		this.profitFactor = this.profitFactorX+this.profitFactorY+this.profitFactorZ;

 	}

 	isProfitable() {
 		if(Config.get('profitAllThree')) {
 			return this.profitFactorX > Config.get('minProfitFactor')
 				&& this.profitFactorY > Config.get('minProfitFactor')
 				&& this.profitFactorZ > Config.get('minProfitFactor')
 				&& this.profitFactorX < Config.get('maxProfitFactor')
 				&& this.profitFactorZ < Config.get('maxProfitFactor')
 				&& this.profitFactorY < Config.get('maxProfitFactor');
 		} else {
	 		return this.profitFactor > Config.get('minProfitFactor');
	 	}
 	}

 	hasEnoughBalance() {
 		this.getBalances();
 		return this.balanceX >= this.inputX
 		&& this.balanceY >= this.inputY
 		&& this.balanceZ >= this.inputZ;
 	}

 	awaitingTrades() {
 		return this.tradeX
 			&& this.tradeY
 			&& this.tradeZ
 			&& this.tradeX.requested
 			&& !this.tradeX.responeded
 			&& this.tradeY.requested
 			&& !this.tradeY.responeded
 			&& this.tradeZ.requested
 			&& !this.tradeZ.responeded;
 	}

 	isTrading() {
 		return global.trading;
 	}

 	static find(currencyCodeX,currencyCodeY,currencyCodeZ) {
 		var currencyX = Currencies.getByCode(currencyCodeX);
 		var currencyY = Currencies.getByCode(currencyCodeY);
 		var currencyZ = Currencies.getByCode(currencyCodeZ);
 		if(currencyX && currencyY && currencyZ) {
 			if(currencyX.isAllowed() && currencyY.isAllowed() && currencyZ.isAllowed()) {
 				try {
 					return new Route(currencyX, currencyY, currencyZ);
 				} catch(e) {
					return false;
				}
			}
		}
	}

	trade() {
		if(Config.get('trade')) {
			trading = true;

			this.tradeX = this.currencyX.tradeTo(this.currencyY, this.inputX, this.priceX).execute();
			this.tradeY = this.currencyY.tradeTo(this.currencyZ, this.inputY, this.priceY).execute();
			this.tradeZ = this.currencyZ.tradeTo(this.currencyX, this.inputZ, this.priceZ).execute();

			setTimeout(function(){ Balances.pulse(); }, 1000);
			setTimeout(function(){ trading = false; }, 2000);
		}
	}

	routeString() {
		return this.currencyX.Currency + (this.currencyX.Currency.length < 4 ? ' ' : '') + ' > '
		+ this.currencyY.Currency + (this.currencyY.Currency.length < 4 ? ' ' : '') + ' > '
		+ this.currencyZ.Currency + (this.currencyZ.Currency.length < 4 ? ' ' : '') + ' > '
		+ this.currencyX.Currency + (this.currencyX.Currency.length < 4 ? ' ' : '') ;
	}

	marketRouteString() {
		return this.marketX.MarketName + (this.marketX.MarketName.length < 8 ? '  ' : ( this.marketX.MarketName.length < 9 ? ' ' : '')) + ' > '
		+ this.marketY.MarketName + (this.marketY.MarketName.length < 8 ? '  ' : ( this.marketY.MarketName.length < 9 ? ' ' : '')) + ' > '
		+ this.marketZ.MarketName + (this.marketZ.MarketName.length < 8 ? '  ' : ( this.marketZ.MarketName.length < 9 ? ' ' : ''));
	}

	calculationString() {
		return Util.pad(Number.parseFloat(this.inputX).toFixed(8))
		+ ' = ' + Util.pad(Number.parseFloat(this.outputX).toFixed(8))
		+ " > " + Util.pad(Number.parseFloat(this.inputY).toFixed(8))
		+ ' = ' + Util.pad(Number.parseFloat(this.outputY).toFixed(8))
		+ " > " + Util.pad(Number.parseFloat(this.inputZ).toFixed(8))
		+ ' = ' + Util.pad(Number.parseFloat(this.outputZ).toFixed(8))
		+ "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX).toFixed(4)) + '%'
		+ " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorY).toFixed(4)) + '%'
		+ " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorZ).toFixed(4)) + '%'
		+ "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactor).toFixed(4)) + '%'
		+ "\t" + (this.hasEnoughBalance() ? "" : "No balance");
	}

	consoleOutput() {
		return this.ouput = ' [' + new Date().toLocaleTimeString() + '] '
		+ this.routeString()
		+ "\t" + this.marketRouteString()
		+ "\t" + this.calculationString();
	}
}