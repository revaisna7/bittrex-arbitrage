var Model = require('../../system/Model.js');
var Trade = require('./Trade.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var Util = require('../../system/Util.js');

module.exports = class Trade extends Model {

    market = null;
    inputCurrency = null;
    outputCurrency = null;
    inputQuantity = null;
    outputQuantity = null;
    tradeQuantity = null;
    price;
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

    static list = [];

    static push(trade) {
        Trade.list.push(trade);
    }

    static getCurrentTrades() {
        var trades = [];
        for (var i in trades) {
            var trade = trades[i];
            if (typeof trade === 'object') {
                if (trade.request && !trade.responeded) {
                    trades.push(trade);
                }
            }
        }
        return trades;
    }

    static consoleOutput() {
        var output = "<h3>Trades (" + Trade.list.length + ") </h3> <table><tr><th>" + ["Time", "Market", "Currency", "Quantity", "Rate"].join("</th><th>") + "</th></tr>";
        for (var i = Trade.list.length - 1; i >= 0; i--) {
            output += "<tr> " + Trade.list[i].consoleOutput() + "</tr>";
            if (Trade.list.length - i == 6) {
                break
            }
            ;
        }
        return output + "</table>";
    }

    constructor(market, inputCurrency, outputCurrency, inputQuantity, price) {
        super();


        this.createdAt = Date.now();
        this.market = market;
        this.inputCurrency = inputCurrency;
        this.outputCurrency = outputCurrency;
        this.inputQuantity = inputQuantity;
        this.price = price;
        this.getTradeQuantity();
        return this;
    }

    getTradeQuantity() {
        this.outputQuantity = this.inputCurrency.convertTo(this.outputCurrency, this.inputQuantity);
        if (this.getMarket().isBaseCurrency(this.outputCurrency)) {
            this.tradeQuantity = this.outputCurrency.convertTo(this.inputCurrency, this.outputQuantity);
        }
        if (this.getMarket().isBaseCurrency(this.inputCurrency)) {
                this.tradeQuantity = this.outputCurrency.convertTo(this.inputCurrency, this.outputQuantity);
        }
       
        this.tradeQuantity = Number.parseFloat(this.tradeQuantity).toFixed(8);
        console.log(this.tradeQuantity);
        return this.tradeQuantity;
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
        return this.type || Trade.config('orderType') || 'LIMIT';
    }

    getTimeInForce() {
        return this.getType() === 'MARKET' ? 'FILL_OR_KILL' : 'GOOD_TIL_CANCELLED';
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
        return Trade.config('useAwards') === true || false;
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
        return this.getMarket().getMinTradeSize() <= this.getTradeQuantity()
    }

    hasBalance() {
        return Balance.getByCurrency(this.inputCurrency).getAvailable() >= this.getTradeQuantity();
    }

    canExecute(debug) {
        if (!this.getMarket().canTrade()) {
            if (debug) {
                console.log("Market not available " + this.getMarket().symbol);
            }
            return false;
        }
        if (!this.meetsMinTradeRequirement()) {
            if (debug) {
                console.log("Trade does not meet minimum requirement. Requirement: " + this.getMarket().getMinTradeSize() + " Quantity: " + this.getTradeQuantity());
            }
            return false;
        }
        if (!this.hasBalance()) {
            if (debug) {
                console.log("Not enough balance for trade. Balance: " + Balance.getByCurrency(this.inputCurrency).getAvailable() + " Quantity: " + this.getTradeQuantity());
                return false;
            }
        }
        return true;
    }

    async execute(callback) {
        if (this.canExecute(true)) {
            Trade.push(this);
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
            if (callback) {
                callback(this);
            }
            return response;

        } else {
            console.log("Cannot execute trade " + this.getMarketSymbol() + " " + this.getType() + " " + this.getDirection());
        }
        return null;
    }

    async executeMarket(callback) {
        if (this.canExecute()) {
            this.logData();
            this.executedAt = Date.now();
            let response = await Bittrex.newOrder(
                    this.getMarketSymbol(),
                    this.getDirection(),
                    "MARKET",
                    "FILL_OR_KILL",
                    this.getQuantity(),
                    this.getCeiling(),
                    this.getPrice(),
                    this.getNote(),
                    this.getUseAwards()
                    );
            this.respondedAt = Date.now();
            this.response = response;
            this.logData();
            if (callback) {
                callback(this);
            }
            return response;

        }
        return null;
    }

    logData() {
        var data = "\n\n" + (new Date().toLocaleString()) + JSON.stringify([
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
        ], null, 2) + "\n";
        Util.log(data, 'trade');
        console.log(data);
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<td>" + [
            new Date(this.getCreatedAt()).toLocaleString(),
            this.getMarketSymbol() + "  ",
            this.getOutputCurrency().getSymbol(),
            Util.pad(this.getQuantity()),
            Util.pad(this.getPrice())
        ].join("</td><td>") + "</td>";
    }
};