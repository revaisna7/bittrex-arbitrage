var Model = require('../../system/Model.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');

module.exports = class Delta extends Model {

    static trading = false;

    route = null;
    inputCurrency = null;
    outputCurrency = null;
    trade = null;
    input = null;
    output = null;
    price = 0;
    priceDeviation = null;

    constructor(route, inputCurrency, outputCurrency) {
        super();

        this.route = route;
        this.inputCurrency = inputCurrency;
        this.outputCurrency = outputCurrency;
        this.market = inputCurrency.getMarket(outputCurrency);
        this.market.routes.push(route);
    }

    isAllowed() {
        return this.inputCurrency.isAllowed()
                && this.outputCurrency.isAllowed()
                && this.market.isAllowed();
    }

    getBtcBalance() {
        return this.inputCurrency.convertToBtc(Balance.getByCurrency(this.inputCurrency).getAvailable());
    }

    getMinBtcMarket() {
        return this.market.getMinTradeSizeBtc();
    }

    getPrice() {
        this.priceDeviation = Delta.config('priceDeviation') || 0;
        if (Delta.config('speculate')) {
            this.price = this.market.getPotentialPrice(this.outputCurrency, this.priceDeviation);
        } else {
            this.price = this.market.getPrice(this.outputCurrency, this.priceDeviation);
        }
        if (this.market.isBaseCurrency(this.inputCurrency)) {
            this.price -= this.priceDeviation / 100 * this.price;
        } else {
            this.price += this.priceDeviation / 100 * this.price;
        }
        return Number.parseFloat(this.price).toFixed(this.market.getPrecision());
    }

    getInput() {
        return this.input = Currency.getBtc().convertTo(this.inputCurrency, this.route.getInputBtc());
    }

    getOuput() {
        this.priceDeviation = Delta.config('priceDeviation') || 0;
        if (Delta.config('speculate')) {
            return this.output = this.market.convertPotential(this.outputCurrency, this.getInput(), this.getPrice());
        } else {
            return this.output = this.market.convert(this.outputCurrency, this.getInput(), this.getPrice());
        }
    }

    isRestricted() {
        return !this.inputCurrency.canTrade()
                || !this.outputCurrency.canTrade()
                || !this.market.canTrade();
    }

    calculate() {
        this.getOuput();
    }

    hasEnoughBalance() {
        return Balance.getByCurrency(this.inputCurrency).getAvailable() >= this.input;
    }

    /**
     * Trade the route
     * @returns {undefined}
     */
    async executeTrade() {
        this.trade = this.market.trade(this.inputCurrency, this.outputCurrency, this.input, this.price);
        return await this.trade.execute();
    }
};