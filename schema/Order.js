var Config = require('./Config.js');
var Bittrex = require('../bittrex/Bittrex.js');
var Currencies = require('./Currencies.js');
var Markets = require('./Markets.js');
var Util = require('./Util.js');

module.exports = class Order {

    canceling = false;
    getting = false;
    marketSymbol = null;
    direction = null;
    type = null;
    quantity = null;
    timeInForce = null;
    fillQuantity = null;
    commission = null;
    proceeds = null;
    status = null;
    createdAt = null;
    updatedAt = null;

    constructor(order) {
        Object.assign(this, order);
    }

    isAllowed() {
        return Config.get('currencies').indexOf(this.Currency) > -1;
    }

    isCanceling() {
        return this.canceling;
    }

    async get() {
        this.getting = true;
        Object.assign(this, Bittrex.orderId(this.id));
        this.getting = false;
    }

    getMarketSymbol() {
        return this.marketSymbol;
    }

    getType() {
        return this.type;
    }

    getQuantity() {
        return Number.parseFloat(this.quantity);
    }

    getLimit() {
        return Number.parseFloat(this.limit);
    }

    getFillQuantity() {
        return Number.parseFloat(this.fillQuantity);
    }

    getComission() {
        return Number.parseFloat(this.comission);
    }

    getProceeds() {
        return Number.parseFloat(this.proceeds);
    }

    getRemaining() {
        return this.getLimit() - this.getFillQuantity();
    }

    getMarket() {
        return Markets.getBySymbol(this.marketSymbol);
    }

    getInputCurrency() {
        var currencySymbols = this.marketSymbol.split('-');
        return this.type === 'BUY' ? Currencies.getBySymbol(currencySymbols[0]) : Currencies.getBySymbol(currencySymbols[1]);
    }

    getOutputCurrency() {
        var currencySymbols = this.marketSymbol.split('-');
        return this.type === 'BUY' ? Currencies.getBySymbol(currencySymbols[1]) : Currencies.getBySymbol(currencySymbols[0]);
    }

    getCurrenctPrice() {
        return this.getMarket().getPrice(this.getOutputCurrency());
    }

    getPriceDifference() {
        return this.type === 'BUY' ? this.getCurrenctPrice() - this.getLimit() : this.getLimit() - this.getCurrenctPrice();
    }
    
    getDifferenceFactor() {
        return this.getPriceDifference() / this.getCurrenctPrice() * 100;
    }

    async cancel() {
        this.canceling = true;
        await Bittrex.deleteOrder(this.id);
        this.canceling = false;
        this.get();
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "\n " + [
            this.getMarketSymbol(),
            this.getType(),
            Util.pad(this.getQuantity()),
            Util.pad(this.getRemaining()),
            Util.pad(this.getLimit()),
            Util.pad(this.getCurrenctPrice()),
            Util.addPlusOrSpace(this.getPriceDifference(), 8),
            Util.addPlusOrSpace(this.getDifferenceFactor()) + '%'
        ].join("\t");
    }
}