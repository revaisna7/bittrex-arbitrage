var Config = require('./Config.js');
var Trades = require('./Trades.js');
var Util = require('./Util.js');
var Balances = require('./Balances.js');
var Currency = require('./Currency.js');
var Bittrex = require('../bittrex/Bittrex.js');

module.exports = class Trade {

    market = null;
    inputCurrency = null;
    outputCurrency = null;
    inputQuantity = null;
    outputQuantity = null;
    tradeQuantity = null;
    price;
    deviaition;
    type = null;
    callback = null;
    requested = false;
    responded = false;
    response = false;
    createdAt = null;
    executedAt = null;
    requestedAt = null;
    respondedAt = null;
    timeInForce = null;

    constructor(market, inputCurrency, outputCurrency, inputQuantity, price, deviaition) {
        this.createdAt = Date.now();
        this.market = market;
        this.inputCurrency = inputCurrency;
        this.outputCurrency = outputCurrency;
        this.inputQuantity = inputQuantity;
        this.price = price;
        this.deviation = deviaition;
        this.getTradeQuantity();
        Trades.push(this);
        return this;
    }

    getTradeQuantity() {
        this.outputQuantity = this.inputCurrency.convertTo(this.outputCurrency, this.inputQuantity, this.deviation);
        if(this.getMarket().isBaseCurrency(this.inputCurrency)) {
            this.tradeQuantity = this.outputCurrency.convertTo(this.inputCurrency, this.outputQuantity);
        }
        if(this.getMarket().isBaseCurrency(this.outputCurrency)) {
            this.tradeQuantity = this.outputQuantity;
        }
    }

    getDirection() {
        return this.getMarket().isBaseCurrency(this.outputCurrency) ? 'BUY' : 'SELL';
    }

    getMarket() {
        return this.market;
    }

    getMarketSymbol() {
        return this.market.symbol;
    }

    getOutputCurrency() {
        return this.outputCurrency;
    }

    getQuantity() {
        return Number.parseFloat(this.tradeQuantity).toFixed(8);
    }

    getPrice() {
        return Number.parseFloat(this.price).toFixed(this.getMarket().getPrecision());
    }

    getType() {
        return this.type || Config.get('orderType') || 'LIMIT';
    }

    getTimeInForce() {
        return this.timeInForce || 'GOOD_TIL_CANCELLED';
    }

    getConditionType() {
        return 'NONE';
    }

    getCeiling() {
        return 0;//this.isBaseCurrency() ? this.quantity / this.getPrice() : this.quantity;
    }

    getNote() {
        return '';
    }

    getUseAwards() {
        return Config.get('useAwards') === true || false;
    }

    getRequest() {
        return this.request;
    }
    
    getCreatedAt() {
        return this.createdAt;
    }
    getExecutedAt() {
        return this.executedAt;
    }
    getRequestedAt() {
        return this.requestedAt;
    }
    getRespondedAt() {
        return this.respondedAt;
    }

    setTypeLimit() {
        this.type = 'LIMIT';
    }
    
    setTypeMarket() {
        this.type = 'MARKET';
        this.timeInForce = 'IMMEDIATE_OR_CANCEL';
    }

    meetsMinTradeRequirement() {
        var marketMinTradeSize = this.getMarket().getMinTradeSize();
        var btcMinTradeSize = Currency.BTC.convertTo(this.getMarket().baseCurrency, 0.0005);
        return marketMinTradeSize < this.getQuantity();
    }

    hasBalance() {
        return Balances.getByCurrency(this.inputCurrency).getAvailable() >= this.inputQuantity;
    }

    canExecute() {
        return this.getMarket().canTrade()
            && this.meetsMinTradeRequirement()
            && this.hasBalance();
    }

    async execute(callback) {
        if(this.canExecute()) {
            this.logData();
            this.executedAt = Date.now();
            let response = await Bittrex.newOrder(
                    this.getMarketSymbol(),
                    this.getDirection(),
                    this.getType(),
                    this.getTimeInForce(),
                    this.getQuantity(),
                    this.getCeiling(),
                    this.getPrice(),
                    this.getNote(),
                    this.getUseAwards()
                    );
            this.respondedAt = Date.now();
            this.response = response;
            this.logData();
            if(callback) {
                callback(this);
            }
            return response;
        }
        return null;
    }

    logData() {
        Util.log("\n\n " + (new Date().toLocaleString()) + JSON.stringify([
            this.getMarketSymbol(),
            this.getDirection(),
            this.getType(),
            this.getTimeInForce(),
            this.getQuantity(),
            this.getCeiling(),
            this.getPrice(),
            this.getNote(),
            this.getUseAwards(),
            this.response
        ], null, 2) + "\n", 'trade');
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return [
            (new Date().setTime(this.getCreatedAt()).toLocaleString()),
            this.getMarketSymbol() + "  ",
            this.getOutputCurrency().getSymbol(),
            Util.pad(this.getQuantity()),
            Util.pad(this.getPrice())
        ].join("\t\t");
    }
}