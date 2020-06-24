var fs = require('fs'),
Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

var Markets = require('./Markets.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Trade = require('./Trade.js');

var trading = false;

function doThen(conditional,then,timer) {
	var timer = timer || 1;
	var interval = setInterval(function(){
		if(conditional()) {
			clearInterval(interval);
			then();
		}
	}, timer);
}

var addPlusOrSpace = function(number, decimals) {
	var decimals = decimals || 3;
	var number = Number.parseFloat(number);
	var str = '';
	if (number === 0) {
		str += ' ';
	}
	if (number < 0) {
		str += "\x1b[31m";
		str += '-';
	}
	if (number > 0) {
		str += "\x1b[32m";
		str += '+';
	}
	if (number < 10 && number > -10) {
		str += '0';
	}
	return str + number.toFixed(decimals).replace('-', '') + "\x1b[0m";
}
var pad = function(number, decimals) {
	var number = Number.parseFloat(number);
	var decimals = decimals || 8;
	var str = '';
	if (number < 10 && number > -10) {
		str += ' ';
	}
	if (number < 100 && number > -100) {
		str += ' ';
	}
	if (number < 1000 && number > -1000) {
		str += ' ';
	}
	return str + number.toFixed(decimals);
}

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

 		this.minBtcBalance = Math.min(this.currencyXBtcBalance,this.currencyYBtcBalance,this.currencyZBtcBalance)*(1-Config.exchangeComission);
 		this.minBtcMarket = Math.min(this.currencyXBtcBalance,this.currencyYBtcBalance,this.currencyZBtcBalance);

 		this.minBtcMarketX = Currencies.getByCode(this.marketX.MarketCurrency).convertTo(this.BTC, this.marketX.MinTradeSize);
 		this.minBtcMarketY = Currencies.getByCode(this.marketY.MarketCurrency).convertTo(this.BTC, this.marketY.MinTradeSize);
 		this.minBtcMarketZ = Currencies.getByCode(this.marketZ.MarketCurrency).convertTo(this.BTC, this.marketZ.MinTradeSize);

 		this.inputBtc = Math.max(Config.minInputBtc, this.minBtcMarketX, this.minBtcMarketY, this.minBtcMarketZ, Math.min(this.minBtcBalance, this.minBtcMarket));

 		this.inputX = this.BTC.convertTo(this.currencyX, this.inputBtc);
 		this.inputY = this.BTC.convertTo(this.currencyY, this.inputBtc);
 		this.inputZ = this.BTC.convertTo(this.currencyZ, this.inputBtc);
 	}

 	getOuputs() {
 		this.outputX = this.currencyX.convertTo(this.currencyY, this.inputX);
 		this.outputY = this.currencyY.convertTo(this.currencyZ, this.inputY);
 		this.outputZ = this.currencyZ.convertTo(this.currencyX, this.inputZ);
 	}

 	isRestricted() {
 		return Config.restricted.includes(this.currencyX.Currency)
 		|| Config.restricted.includes(this.currencyY.Currency)
 		|| Config.restricted.includes(this.currencyZ.Currency)
 		|| this.marketX.IsRestricted
 		|| this.marketY.IsRestricted
 		|| this.marketZ.IsRestricted;
 	}

 	calculate() {
 		this.getInputs();
 		this.getOuputs();
 		this.calculateProfit();
 		if(this.isProfitable()  && this.hasEnoughBalance() && this.isntTrading()) {
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
 		return this.profitFactor > Config.minProfitFactor;
 	}

 	hasEnoughBalance() {
 		this.getBalances();
 		return this.balanceX >= this.inputX
 		&& this.balanceY >= this.outputX
 		&& this.balanceZ >= this.outputY;
 	}

 	isTrading() {
 		return trading;
 	}

 	isntTrading() {
 		return !trading;
 	}

 	trade() {
 		if(Config.trade) {
 			trading = true;

 			var inputX = this.isXBase ? this.inputY : this.inputX;
 			var inputY = this.isYBase ? this.inputZ : this.inputY;
 			var inputZ = this.isZBase ? this.inputX : this.inputZ;

 			var priceX = this.marketX.getPrice(this.currencyY);
 			var priceY = this.marketY.getPrice(this.currencyZ);
 			var priceZ = this.marketZ.getPrice(this.currencyX);

 			this.tradeX = new Trade(this.marketX, this.currencyY, inputX, priceX);
 			this.tradeY = new Trade(this.marketY, this.currencyZ, inputY, priceY);
 			this.tradeZ = new Trade(this.marketZ, this.currencyX, inputZ, priceZ);

 			this.tradeX.deviate(this.profitFactorX);
 			this.tradeY.deviate(this.profitFactorY);
 			this.tradeZ.deviate(this.profitFactorZ);

 			this.tradeX.execute();
 			this.tradeY.execute();
 			this.tradeZ.execute();

 			var _this = this;			
 			doThen(
 				function() {
 					return _this.tradeX.requested && !_this.tradeX.responeded
 					&& _this.tradeY.requested && !_this.tradeY.responeded
 					&& _this.tradeZ.requested && !_this.tradeZ.responeded
 				},
 				function(){
 					Balances.get();
 					setTimeout(function(){ trading = false; }, 5000);
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
 		return pad(Number.parseFloat(this.inputX).toFixed(8))
 		+ ' = ' + pad(Number.parseFloat(this.outputX).toFixed(8))
 		+ " > " + pad(Number.parseFloat(this.inputY).toFixed(8))
 		+ ' = ' + pad(Number.parseFloat(this.outputY).toFixed(8))
 		+ " > " + pad(Number.parseFloat(this.inputZ).toFixed(8))
 		+ ' = ' + pad(Number.parseFloat(this.outputZ).toFixed(8))
 		+ "\t" + addPlusOrSpace(Number.parseFloat(this.profitFactorX).toFixed(4)) + '%'
 		+ " " + addPlusOrSpace(Number.parseFloat(this.profitFactorY).toFixed(4)) + '%'
 		+ " " + addPlusOrSpace(Number.parseFloat(this.profitFactorZ).toFixed(4)) + '%'
 		+ "\t" + addPlusOrSpace(Number.parseFloat(this.profitFactor).toFixed(4)) + '%'
 		+ "\t" + (this.hasEnoughBalance() ? "" : "No balance") + (this.isTrading() ? "Trade" : "");
 	}

 	consoleOutput() {
 		return this.ouput = ' [' + new Date().toLocaleTimeString() + '] '
 		+ this.routeString()
 		+ "\t" + this.marketRouteString()
 		+ "\t" + this.calculationString();
 	}
 }