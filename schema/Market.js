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

    /**
     * Constructor for market
     * 
     * @param {OBject} market Bittrex market response object
     * @returns {Market}
     */
    constructor(market) {
        Object.assign(this, market);
        this.getCurrencies();
        this.orderBook = new OrderBook(this);

        this.baseCurrency.addMarket(this);
        this.quoteCurrency.addMarket(this);

        return this;
    }

    /**
     * Find base and quote currency and set them
     * 
     * @returns {undefined}
     */
    getCurrencies() {
        this.baseCurrency = Currencies.getBySymbol(this.baseCurrencySymbol);
        this.quoteCurrency = Currencies.getBySymbol(this.quoteCurrencySymbol);
    }

    /**
     * Whether the given currency is the base currency of this market
     * 
     * @param {Currency} currency
     * @returns {Boolean}
     */
    isBaseCurrency(currency) {
        return currency.symbol === this.baseCurrency.symbol;
    }

    /**
     * Whether the given currency is the quote currency of this market
     * 
     * @param {type} currency
     * @returns {Boolean}
     */
    isQuoteCurrency(currency) {
        return currency.symbol === this.quoteCurrency.symbol;
    }

    /**
     * Whether the configuration allows the market to be traded
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return Config.get('currencies').indexOf(this.baseCurrencySymbol) > -1
                && Config.get('currencies').indexOf(this.quoteCurrencySymbol) > -1;
    }

    /**
     * Whether the market is restricted
     * 
     * @returns {Boolean}
     */
    isRestricted() {
        return Config.get('restrictedMarkets').indexOf(this.symbol) > -1;
    }

    /**
     * Whether the market is online
     * 
     * @returns {Boolean}
     */
    isOnline() {
        return this.status === 'ONLINE';
    }

    /**
     * Get the price precision of the market
     * 
     * @returns {Number}
     */
    getPrecision() {
        return Number.parseInt(this.precision);
    }

    /**
     * Get the minimum trade size of the market
     * 
     * @returns {Number}
     */
    getMinTradeSize() {
        return Number.parseFloat(this.minTradeSize);
    }

    /**
     * Get the minimum trade size of the market
     * 
     * @returns {Number}
     */
    getMinTradeSizeBtc() {
        return this.baseCurrency.convertToBtc(this.getMinTradeSize());
    }

    /**
     * Whether the market can trade
     * 
     * The market can trade when the currencies are configured
     * When the market is not restricted in the configuration
     * When the market is online
     * 
     * @returns {Boolean}
     */
    canTrade() {
        return this.isAllowed()
                && !this.isRestricted()
                && this.isOnline();
    }

    /**
     * Get the current market price for the given currency
     * 
     * @param {Currency} currency The currency to get the price for
     * @param {Number} priceDeviation A factor to deviate the price by
     * @returns {Number}
     */
    getPrice(currency, priceDeviation) {
        if(!priceDeviation) {
            priceDeviation = 0;
        }
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Ask();
            price += priceDeviation / 100 * price;
        } else {
            price = this.Bid();
            price -= priceDeviation / 100 * price;
        }
        return Number.parseFloat(price).toPrecision(this.getPrecision());
    }

    /**
     * Get the current reversed market prices for the given currency
     * Does the same as getPrice but switches Ask to Bid and Bid to Ask
     * 
     * @param {Currency} currency The currency to get the price for
     * @param {Number} priceDeviation A factor to deviate the price by
     * @returns {Number}
     */
    getPotentialPrice(currency, priceDeviation) {
        if(!priceDeviation) {
            priceDeviation = 0;
        }
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Bid();
            price += priceDeviation / 100 * price;
        } else {
            price = this.Ask();
            price -= priceDeviation / 100 * price;
        }
        return Number.parseFloat(price).toPrecision(this.getPrecision());
    }

    /**
     * Current ask price from the order book
     * 
     * @returns {Number}
     */
    Ask() {
        return Number.parseFloat(this.orderBook.Ask());
    }

    /**
     * Accumulative quantity of available coins available at and under the given
     * price
     * 
     * @param {type} price
     * @returns {Number}
     */
    Asks(price) {
        return this.orderBook.Asks(price);
    }

    /**
     * Current bid price from the order book
     * 
     * @returns {Number}
     */
    Bid() {
        return Number.parseFloat(this.orderBook.Bid());
    }

    /**
     * Accumulative quantity of available coins available at and above the given
     * price
     * 
     * @param {type} price
     * @returns {Number}
     */
    Bids(price) {
        return this.orderBook.Bids(price);
    }

    /**
     * Get quantity available for given currency
     * 
     * @param {Currency} currency
     * @param {Number} price
     * @returns {Number}
     */
    getQuantityAvailable(currency, price) {
        return this.isBaseCurrency(currency) ? this.Asks(price) : this.Bids(price);
    }

    /**
     * Get quantity available for given currency at the reversed price
     * 
     * @param {Currency} currency
     * @param {Number} price
     * @returns {Number}
     */
    getPotentialQuantityAvailable(currency, rate) {
        return this.isBaseCurrency(currency) ? this.Bids(rate) : this.Asks(rate);
    }

    /**
     * Trade the output currency to the input currency of in this market
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @optional {Number} price The price
     * @optional {Number} deviaiton Price deviation factor
     * @returns {Trade}
     */
    trade(inputCurrency, outputCurrency, inputQauntity, price, deviaiton) {
        if (!price) {
            price = this.getPrice(outputCurrency, deviaiton);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price);
    }

    /**
     * Trade the output currency to the input currency of in this market at
     * reversed prices
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @optional {Number} price The price
     * @optional {Number} deviaiton Price deviation factor
     * @returns {Trade}
     */
    tradePotential(inputCurrency, outputCurrency, inputQauntity, price, deviaiton) {
        if (!price) {
            price = this.getPotentialPrice(outputCurrency, deviaiton);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price);
    }

    /**
     * Convert the input currency to the output currency at current market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency The currency to convert
     * @param {Currency} inputQuantity The currency convert to
     * @param {Number} priceDeviation Price deviation factor
     * @returns {Number}
     */
    convert(outputCurrency, inputQuantity, priceDeviation) {
        var price = this.getPrice(outputCurrency, priceDeviation);
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output - (Config.get('exchangeCommission') / 100 * output);
    }

    /**
     * Convert the input currency to the output currency at reversed market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency
     * @param {Currency} inputQuantity
     * @param {Number} priceDeviation
     * @returns {Number}
     */
    convertPotential(outputCurrency, inputQuantity, priceDeviation) {
        var price = this.getPotentialPrice(outputCurrency, priceDeviation);
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output - (Config.get('exchangeCommission') / 100 * output);
    }

    /**
     * Trigger the calculation of the routes assciated to this market
     * 
     * @returns {undefined}
     */
    triggerRoutes() {
        for (var i in this.routes) {
            if (typeof this.routes[i] === 'object') {
                this.routes[i].calculate();
            }
        }
    }

    getTickData(timeFrame, startDate) {
        // @todo
    }
};