var Model = require('../../system/Model.js');
var Trade = require('./Trade.js');
var OrderBook = require('./OrderBook.js');
var Currency = require('./Currency.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');

module.exports = class Market extends Model {

    /**
     * @property {String} symbol 
     */
    symbol = null;

    /**
     * @property {String} baseCurrencySymbol 
     */
    baseCurrencySymbol = null;

    /**
     * @property {String} quoteCurrencySymbol 
     */
    quoteCurrencySymbol = null;

    /**
     * @property {Currency} baseCurrency 
     */
    baseCurrency = null;

    /**
     * @property {Currency} quoteCurrency 
     */
    quoteCurrency = null;

    /**
     * @property {String} minTradeSize 
     */
    minTradeSize = 0;

    /**
     * @property {String} precision 
     */
    precision = 0;

    /**
     * @property {String} createdAt 
     */
    createdAt = null;

    /**
     * @property {String} notice 
     */
    notice = null;

    /**
     * @property {Array} prohibitedIn 
     */
    prohibitedIn = null;

    /**
     * @property {OrderBook} orderBook 
     */
    orderBook = null;

    /**
     * @property {Array|Object[]} tickData 
     */
    tickData = [];

    /**
     * @property {Array|Route[]} routes 
     */
    routes = [];

    static list = [];

    /**
     * Initialize markets
     * @returns {undefined}
     */
    static async init() {
        console.log('Inititialize Market...');
        return await Market.getAll();
    }

    /**
     * Get markets from bittres and assign them to the list when they are not
     * already in it
     * 
     * @returns {undefined}
     */
    static async getAll() {
        let markets = await Bittrex.markets();
        for (var i in markets) {
            if (!Market.getBySymbol(Market.symbol)) {
                Market.push(new Market(markets[i]));
            }
        }
    }

    /**
     * Push market to list
     * 
     * @param {Market} market
     * @returns {undefined}
     */
    static push(market) {
        Market.list.push(market);
    }

    /**
     * @TODO
     * 
     * @returns {undefined}
     */
    static subscribeOrderBooks() {
        Market.startOrderBooksUpdates();
        Market.subscribeSockets();
    }

    /**
     * Get a list of markets that are allowed to trade
     * 
     * @returns {Array|Market[]}
     */
    static getUsedMarkets() {
        var markets = [];
        for (var i in Market.list) {
            if (Market.list[i].canTrade()) {
                Market.push(Market.list[i]);
            }
        }
        return markets;
    }

    /**
     * List of market symbols that are allowed to trade
     * 
     * @returns {Array|String[]}
     */
    static getUsedMarketSymbols() {
        var marketSymbols = [];
        var markets = Market.getUsedMarkets();
        for (var i in markets) {
            marketSymbols.push(markets[i].symbol);
        }
        return marketSymbols;
    }

    /**
     * Get a market by its symbol
     * @param {type} marketSymbol
     * @returns {String}
     */
    static getBySymbol(marketSymbol) {
        for (var i in Market.list) {
            if (Market.list[i].symbol === marketSymbol) {
                return Market.list[i];
            }
        }
    }

    static getByCurrencies(currencyX, currencyY) {
        for (var i in Market.list) {
            if (Market.list[i].symbol === currencyX.symbol + '-' + currencyY.symbol
                    || Market.list[i].symbol === currencyY.symbol + '-' + currencyX.symbol) {
                return Market.list[i];
            }
        }
        return null;
    }

    /**
     * Constructor for market
     * 
     * @param {Object} market Bittrex market response object
     * @returns {Market}
     */
    constructor(market) {
        super();
        Object.assign(this, market);
        this.getCurrencies();
        this.orderBook = new OrderBook(this);

        this.baseCurrency.addMarket(this);
        this.quoteCurrency.addMarket(this);

        return this;
    }

    /**
     * List of restricted currency symbols from configuration
     * 
     * @returns {Array|String[]}
     */
    static getRestricted() {
        return Market.config('restrict') || [];
    }

    /**
     * Whether the market is restricted
     * 
     * @returns {Boolean}
     */
    isRestricted() {
        return Market.getRestricted().indexOf(this.symbol) > -1;
    }

    /**
     * Whether the configuration allows the market to be traded
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return this.baseCurrency.isAllowed()
                && this.quoteCurrency.isAllowed()
                && !this.isRestricted();
    }

    /**
     * Find base and quote currency and set them
     * 
     * @returns {undefined}
     */
    getCurrencies() {
        this.baseCurrency = Currency.getBySymbol(this.baseCurrencySymbol);
        this.quoteCurrency = Currency.getBySymbol(this.quoteCurrencySymbol);
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
     * @returns {Number}
     */
    getPrice(currency) {
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Ask();
        } else {
            price = this.Bid();
        }
        return Number.parseFloat(price).toFixed(this.getPrecision());
    }

    /**
     * Get the current reversed market prices for the given currency
     * Does the same as getPrice but switches Ask to Bid and Bid to Ask
     * 
     * @param {Currency} currency The currency to get the price for
     * @returns {Number}
     */
    getPotentialPrice(currency) {
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Bid();
        } else {
            price = this.Ask();
        }
        return Number.parseFloat(price).toFixed(this.getPrecision());
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
     * @param {Number} price
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
     * @param {Number} price
     * @returns {Number}
     */
    Bids(price) {
        return this.orderBook.Bids(price);
    }

    /**
     * Get quantity available for given currency
     * 
     * @param {Currency} currency
     * @param {Number} [price]
     * @returns {Number}
     */
    getQuantityAvailable(currency, price) {
        return this.isBaseCurrency(currency) ? this.Asks(price) : this.Bids(price);
    }

    /**
     * Get quantity available for given currency at the reversed price
     * 
     * @param {Currency} currency
     * @param {Number} [price]
     * @returns {Number}
     */
    getPotentialQuantityAvailable(currency, price) {
        return this.isBaseCurrency(currency) ? this.Bids(price) : this.Asks(price);
    }

    /**
     * Trade the input currency to the output currency in this market
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @param {Number} [price] The price
     * @returns {Trade}
     */
    trade(inputCurrency, outputCurrency, inputQauntity, price) {
        if (!price) {
            price = this.getPrice(outputCurrency);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price);
    }

    /**
     * Trade the input currency to the output currency in this market at
     * reversed prices
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @param {Number} [price] The price
     * @returns {Trade}
     */
    tradePotential(inputCurrency, outputCurrency, inputQauntity, price) {
        if (!price) {
            price = this.getPotentialPrice(outputCurrency);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price);
    }

    /**
     * Convert the input currency to the output currency at current market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency The currency to convert
     * @param {Currency} inputQuantity The currency convert to
     * @param {Number} [price]
     * @returns {Number}
     */
    convert(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output - (Market.config('commission') / 100 * output);
    }

    /**
     * Convert the input currency to the output currency at reversed market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency
     * @param {Currency} inputQuantity
     * @param {Number} [price]
     * @returns {Number}
     */
    convertPotential(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getPotentialPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output - (Market.config('commission') / 100 * output);
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