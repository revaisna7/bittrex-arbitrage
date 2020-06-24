var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

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
	}

	isRestricted() {
		return Config.restricted.indexOf(this.BaseCurrencyCode) > -1 || Config.restricted.indexOf(this.QuoteCurrencyCode) > -1;
	}

	isAllowed() {
		return Config.currencies.indexOf(this.BaseCurrencyCode) > -1 && Config.currencies.indexOf(this.QuoteCurrencyCode) > -1;
	}

	getPrice(currency) {
		if(this.isBaseCurrency(currency)) {
			return this.getHighestBuyPrice().toFixed(currency.getPrecision());
		} else {
			return this.getLowestSellPrice().toFixed(currency.getPrecision());
		}
	}

	getQuantity(currency) {
		var quantity;
		if(this.isBaseCurrency(currency)) {
			quantity = this.getHighestBuyQuantity();
		} else {
			quantity = this.getLowestSellQuantity();
		}
		return quantity.toFixed(currency.getPrecision());
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

	getHighestBuyQuantity() {
		this.Buys.sort(this.compareBuys);
		return this.Buys[0].Quantity;
	}

	getLowestSellPrice() {
		this.Sells.sort(this.compareSells);
		return this.Sells.length > 0 ? this.Sells[0].Rate : 0;
	}

	getLowestSellQuantity() {
		this.Sells.sort(this.compareSells);
		return this.Sells[0].Quantity;
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
		this.trade = new Trade(this, outputCurrency, quantity, rate);
		this.trade.execute();
	}

	isBaseCurrency(currency) {
		return currency.Currency === this.BaseCurrencyCode;
	}

	convert(outputCurrency, inputQuantity) {
		var inputQuantity = inputQuantity;
		var price = this.getPrice(outputCurrency);
		var output = this.isBaseCurrency(outputCurrency) ? inputQuantity * price : inputQuantity / price;
		return  output - (output/100*Config.exchangeComission/100);
	}
};