var Config = require('./Config.js');
var Trade = require('./Trade.js');
var OrderBook = require('./OrderBook.js');
var Currencies = require('./Currencies.js');

module.exports = class Market {

    symbol = null;
    baseCurrencySymbol = null;
    quoteCurrencySymbol = null;
    baseCurrency = null;
    quoteCurrency = null;
    minTradeSize = 0;
    precision = 0;
    createdAt = null;
    notice = null;
    prohibitedIn = null;
    orderBook = null;
    tickData = [];
    routes = [];

    constructor(market) {
        Object.assign(this, market);
        this.getCurrencies();
        this.orderBook = new OrderBook(this);

        this.baseCurrency.addMarket(this);
        this.quoteCurrency.addMarket(this);

        return this;
    }

    getCurrencies() {
        this.baseCurrency = Currencies.getBySymbol(this.baseCurrencySymbol);
        this.quoteCurrency = Currencies.getBySymbol(this.quoteCurrencySymbol);
    }

    isAllowed() {
        return Config.get('currencies').indexOf(this.baseCurrencySymbol) > -1
                && Config.get('currencies').indexOf(this.quoteCurrencySymbol) > -1;
    }

    isRestricted() {
        return Config.get('restrictedMarkets').indexOf(this.symbol) > -1;
    }

    isOnline() {
        return this.status === 'ONLINE';
    }

    getPrecision() {
        return Number.parseInt(this.precision);
    }

    getMinTradeSize() {
        return Number.parseFloat(this.minTradeSize);
    }

    canTrade() {
        return this.isAllowed()
                && !this.isRestricted()
                && this.isOnline();
    }

    getPrice(currency, priceDeviation) {
        priceDeviation = priceDeviation || 0;
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Ask();
            price += priceDeviation / 100 * price;
        } else {
            price = this.Bid();
            price -= priceDeviation / 100 * price;
        }
        return price;
    }

    getPotentialPrice(currency, priceDeviation) {
        priceDeviation = priceDeviation || 0;
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Bid();
            price += priceDeviation / 100 * price;
        } else {
            price = this.Ask();
            price -= priceDeviation / 100 * price;
        }
        return price;
    }

    Ask() {
        return Number.parseFloat(this.orderBook.Ask());
    }

    Asks(rate) {
        return this.orderBook.Asks(rate);
    }

    Bid() {
        return Number.parseFloat(this.orderBook.Bid());
    }

    Bids(rate) {
        return this.orderBook.Bids(rate);
    }

    getQuantityAvailable(currency, rate) {
        return this.isBaseCurrency(currency) ? this.Asks(rate) : this.Bids(rate);
    }

    getPotentialQuantityAvailable(currency, rate) {
        return this.isBaseCurrency(currency) ? this.Bids(rate) : this.Asks(rate);
    }

    triggerRoutes() {
        for (var i in this.routes) {
            if (typeof this.routes[i] === 'object') {
                this.routes[i].calculate();
            }
        }
    }

    /**
     * Trade the output currency to the input currency of in this market
     * 
     * @param {Currency} inputCurrency
     * @param {Currency} outputCurrency
     * @param {float} inputQauntity
     * @optional {float} price 
     * @optional {float} deviaiton
     * @returns {Trade}
     */
    trade(inputCurrency, outputCurrency, inputQauntity, price, deviaiton) {
        price = price || this.getPrice(outputCurrency, deviaiton);
        deviaiton = deviaiton || 0;
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price, deviaiton);
    }

    /**
     * 
     * @param {type} outputCurrency
     * @param {type} inputQauntity
     * @param {type} price
     * @param {type} deviaiton
     * @returns {Trade}
     */
    tradePotential(inputCurrency, outputCurrency, inputQauntity, price, deviaiton) {
        price = price || this.getPotentialPrice(outputCurrency, deviaiton);
        deviaiton = deviaiton || 0;
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price, deviaiton);
    }

    isBaseCurrency(currency) {
        return currency.symbol === this.baseCurrency.symbol;
    }
    
    isQuoteCurrency(currency) {
        return currency.symbol === this.quoteCurrency.symbol;
    }

    convert(outputCurrency, inputQuantity, priceDeviation) {
        priceDeviation = priceDeviation || 0;
        var price = this.getPrice(outputCurrency, priceDeviation);
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : inputQuantity * price;
        return  output - (Config.get('exchangeCommission') / 100 * output);
    }

    convertPotential(outputCurrency, inputQuantity, priceDeviation) {
        priceDeviation = priceDeviation || 0;
        var price = this.getPotentialPrice(outputCurrency, priceDeviation);
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : inputQuantity * price;
        return  output - (Config.get('exchangeCommission') / 100 * output);
    }

    getTickData(timeFrame, startDate) {
        // @todo
    }
};