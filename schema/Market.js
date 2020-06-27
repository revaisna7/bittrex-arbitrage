var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var Trade = require('./Trade.js');
var Util = require('./Util.js');

module.exports = class Market {
	constructor(market) {
		Object.assign(this, market);
		this.routes = [];
		this.Buys = [];
		this.Sells = [];
		this.Fills = [];
		this.DeletedFills = [];
		this.CurrencyCodes = this.MarketName.split('-');
		this.BaseCurrencyCode = this.CurrencyCodes[0];
		this.QuoteCurrencyCode = this.CurrencyCodes[1];
		this.getOrderBook();

		return this;
	}

	isRestricted() {
		return Config.get('restricted').indexOf(this.BaseCurrencyCode) > -1 || Config.get('restricted').indexOf(this.QuoteCurrencyCode) > -1;
	}

	isAllowed() {
		return Config.get('currencies').indexOf(this.BaseCurrencyCode) > -1 && Config.get('currencies').indexOf(this.QuoteCurrencyCode) > -1;
	}

	getPrice(currency, priceDeviation) {
		var priceDeviation = priceDeviation || 0;
		if(this.isBaseCurrency(currency)) {
			var price = this.getHighestBuyPrice();
			return (price+(priceDeviation/100*price)).toFixed(currency.getPrecision());
		} else {
			var price = this.getLowestSellPrice();
			return (price-(priceDeviation/100*price)).toFixed(currency.getPrecision());
		}
	}

	getPotentialPrice(currency, priceDeviation) {
		var priceDeviation = priceDeviation || 0;
		if(!this.isBaseCurrency(currency)) {
			var price = this.getHighestBuyPrice();
			return (price+(priceDeviation/100*price)).toFixed(currency.getPrecision());
		} else {
			var price = this.getLowestSellPrice();
			return (price-(priceDeviation/100*price)).toFixed(currency.getPrecision());
		}
	}

	getQuantity(currency, rate) {
		if(this.isBaseCurrency(currency)) {
			return this.getBuyQuantity(rate);
		} else {
			return this.getSellQuantity(rate);
		}
	}

	getPotentialQuantity(currency, rate) {
		if(!this.isBaseCurrency(currency)) {
			return this.getBuyQuantity(rate);
		} else {
			return this.getSellQuantity(rate);
		}
	}

	getOrderBookBuy(rate) {
		for(var i in this.Buys) {
			if(this.Buys[i].Rate == rate) {
				return this.Buys[i];
			}
		}
	}

	getOrderBookSell(rate) {
		for(var i in this.Sells) {
			if(this.Sells[i].Rate == rate) {
				return this.Sells[i];
			}
		}
	}

	addOrderBookBuy(order) {
		this.Buys.push(order);
	}

	removeOrderBookBuy(order) {
		const index = this.Buys.indexOf(order);
		if (index > -1) {
		  this.Buys.splice(index, 1);
		}
	}

	addOrderBookSell(order) {
		this.Sells.push(order);
	}

	removeOrderBookSell(order) {
		const index = this.Sells.indexOf(order);
		if (index > -1) {
		  this.Sells.splice(index, 1);
		}
	}

	compareBuys(a,b) {
		if (a.Rate > b.Rate)
			return -1;
		if (a.Rate < b.Rate)
			return 1;
		return 0;
	}

	compareSells(a,b) {
		if (a.Rate < b.Rate)
			return -1;
		if (a.Rate > b.Rate)
			return 1;
		return 0;
	}

	getHighestBuyPrice() {
		this.Buys.sort(this.compareBuys);
		return this.Buys.length > 0 ? this.Buys[0].Rate : 0;
	}

	getBuyQuantity(price) {
		var quantity = 0;
		for(var i in this.Buys) {
			if(this.Buys[i].Rate >= price) {
				quantity += this.Buys[i].Quantity;
			}
		}
		return quantity;
	}

	getLowestSellPrice() {
		this.Sells.sort(this.compareSells);
		return this.Sells.length > 0 ? this.Sells[0].Rate : 0;
	}

	getSellQuantity(price) {
		var quantity = 0;
		for(var i in this.Sells) {
			if(this.Sells[i].Rate <= price) {
				quantity += this.Sells[i].Quantity;
			}
		}
		return quantity;
	}

	updateExchangeState(data) {
		for(var i in data.Buys) {
			var orderBookBuy = this.getOrderBookBuy(data.Buys[i].Rate);
			switch(data.Buys[i].Type) {
				case 0 :
					if(orderBookBuy) {
						orderBookBuy = data.Buys[i];
					} else {
						this.addOrderBookBuy(data.Buys[i]);
					}
					break;
				case 2 :
					if(orderBookBuy) {
						orderBookBuy.Quantity = data.Buys[i].Quantity;
					} else {
						this.addOrderBookBuy(data.Buys[i]);
					}
					break;
				case 1 :
					if(orderBookBuy) {
						this.removeOrderBookBuy(orderBookBuy);
					}
					break;
			}
		}

		for(var i in data.Sells) {
			var orderBookSell = this.getOrderBookSell(data.Sells[i].Rate);
			switch(data.Sells[i].Type) {
				case 0 :
					if(orderBookSell) {
						orderBookSell = data.Sells[i];
					} else {
						this.addOrderBookSell(data.Sells[i]);
					}
					break;
				case 2 :
					if(orderBookSell) {
						orderBookSell.Quantity = data.Sells[i].Quantity;
					} else {
						this.addOrderBookSell(data.Sells[i]);
					}
					break;
				case 1 :
					if(orderBookSell) {
						this.removeOrderBookSell(orderBookSell);
					}
					break;
			}
		}

		this.triggerRoutes();
	}

	triggerRoutes() {
		for(var i in this.routes) {
			if(typeof this.routes[i] === 'object') {
				this.routes[i].calculate();
			}
		}
	}

	getOrderBook() {
		if(this.isAllowed()) {
			var _this = this;
			bittrex.getorderbook({market: this.MarketName, type: 'both'}, function(data,err){ _this.setOrderBook(data,err); });
		}
	}

	setOrderBook(data,err) {
		if(data && data.success) {
			this.Buys = data.result.buy;
			this.Sells = data.result.sell;
			this.triggerRoutes();
		}
		if(err) {
			Util.logError(err);
		}
	}

	getPrecision(currency) {
		return this.BaseCurrencyCode === 'USD' || this.QuoteCurrencyCode === 'USD' ? 3 : 8;
	}

	trade(outputCurrency, quantity, rate) {
		return new Trade(this, outputCurrency, quantity, rate);
	}

	isBaseCurrency(currency) {
		return currency.Currency === this.BaseCurrencyCode;
	}

	convert(outputCurrency, inputQuantity, priceDeviation) {
		var priceDeviation = priceDeviation || 0;
		var isBase = this.isBaseCurrency(outputCurrency);
		var price = this.getPrice(outputCurrency, priceDeviation);
		var output = isBase ? inputQuantity * price : inputQuantity / price;
		return  output - (Config.get('exchangeCommission')/100*output);
	}

	convertPotential(outputCurrency, inputQuantity, priceDeviation) {
		var priceDeviation = priceDeviation || 0;
		var isBase = this.isBaseCurrency(outputCurrency);
		var price = this.getPotentialPrice(outputCurrency, priceDeviation);
		var output = isBase ? inputQuantity * price : inputQuantity / price;
		return  output - (Config.get('exchangeCommission')/100*output);
	}
};