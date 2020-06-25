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


 		this.tradeX = null;
 		this.tradeY = null;
 		this.tradeZ = null;

 		this.profitFactor = 0;
 		this.BTC = null;
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

 		this.BTC = this.BTC || Currencies.getBtc();

 		this.currencyXBtcBalance = this.currencyX.convertTo(this.BTC, this.balanceX);
 		this.currencyYBtcBalance = this.currencyY.convertTo(this.BTC, this.balanceY);
 		this.currencyZBtcBalance = this.currencyZ.convertTo(this.BTC, this.balanceZ);

 		this.marketXBtcQuantity = this.currencyX.convertTo(this.BTC, this.marketX.getQuantity(this.currencyY));
 		this.marketYBtcQuantity = this.currencyY.convertTo(this.BTC, this.marketY.getQuantity(this.currencyZ));
 		this.marketZBtcQuantity = this.currencyZ.convertTo(this.BTC, this.marketZ.getQuantity(this.currencyX));

 		this.minBtcBalance = Math.min(this.currencyXBtcBalance,this.currencyYBtcBalance,this.currencyZBtcBalance)*(1-Config.get('exchangeComission'));
 		this.minBtcMarket = Math.min(this.currencyXBtcBalance,this.currencyYBtcBalance,this.currencyZBtcBalance);

 		this.minBtcMarketX = Currencies.getByCode(this.marketX.MarketCurrency).convertTo(this.BTC, this.marketX.MinTradeSize);
 		this.minBtcMarketY = Currencies.getByCode(this.marketY.MarketCurrency).convertTo(this.BTC, this.marketY.MinTradeSize);
 		this.minBtcMarketZ = Currencies.getByCode(this.marketZ.MarketCurrency).convertTo(this.BTC, this.marketZ.MinTradeSize);

 		this.inputBtc = Math.max(Config.get('maxInputBtc'), Config.get('minInputBtc'), this.minBtcMarketX, this.minBtcMarketY, this.minBtcMarketZ, this.minBtcBalance, this.minBtcMarket);

 		this.inputX = this.BTC.convertTo(this.currencyX, this.inputBtc);
 		this.inputY = this.BTC.convertTo(this.currencyY, this.inputBtc);
 		this.inputZ = this.BTC.convertTo(this.currencyZ, this.inputBtc);
 	}

 	getOuputs() {
 		this.outputX = Config.get('speculate') ? this.currencyX.convertToPotential(this.currencyY, this.inputX) : this.currencyX.convertTo(this.currencyY, this.inputX);
 		this.outputY = Config.get('speculate') ? this.currencyY.convertToPotential(this.currencyZ, this.inputY) : this.currencyY.convertTo(this.currencyZ, this.inputY);
 		this.outputZ = Config.get('speculate') ? this.currencyZ.convertToPotential(this.currencyX, this.inputZ) : this.currencyZ.convertTo(this.currencyX, this.inputZ);
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
 		return this.profitFactor > Config.get('minProfitFactor');
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

			var inputX = this.isXBase ? this.inputY : this.inputX;
			var inputY = this.isYBase ? this.inputZ : this.inputY;
			var inputZ = this.isZBase ? this.inputX : this.inputZ;

			var priceX = Config.get('speculate') ? this.marketX.getPotentialPrice(this.currencyY) : this.marketX.getPrice(this.currencyY);
			var priceY = Config.get('speculate') ? this.marketY.getPotentialPrice(this.currencyZ) : this.marketY.getPrice(this.currencyZ);
			var priceZ = Config.get('speculate') ? this.marketZ.getPotentialPrice(this.currencyX) : this.marketZ.getPrice(this.currencyX);

			this.tradeX = new Trade(this.marketX, this.currencyY, inputX, priceX);
			this.tradeY = new Trade(this.marketY, this.currencyZ, inputY, priceY);
			this.tradeZ = new Trade(this.marketZ, this.currencyX, inputZ, priceZ);

			// this.tradeX.deviate(this.profitFactorX);
			// this.tradeY.deviate(this.profitFactorY);
			// this.tradeZ.deviate(this.profitFactorZ);

			this.tradeX.execute();
			this.tradeY.execute();
			this.tradeZ.execute();
	
			var _this = this;
			Util.when(
				function() {
					return _this.awaitingTrades();
				},
				function() {
					Balances.get();
					Util.when(
						function() {
							return Balances.isGetting();
						},
						function() {
							setTimeout(function() { global.trading = false; }, 100);
						}
					)
				}
			);
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