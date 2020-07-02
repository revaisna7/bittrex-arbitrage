var Config = require('./Config.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');

module.exports = class RouteDelta {

    static trading = false;

    route = null;
    inputCurrency = null;
    outputCurrency = null;
    trade = null;
    input = null;
    output = null;
    priceDeviation = null;

    constructor(route, inputCurrency, outputCurrency) {
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
        return this.inputCurrency.convertToBtc(Balances.getByCurrency(this.inputCurrency).getAvailable());
    }

    getMinBtcMarket() {
        return this.market.getMinTradeSizeBtc();
    }

    getPrice() {
        this.priceDeviation = Config.get('priceDeviation') || 0;
        if (Config.get('speculate')) {
            this.price = this.inputCurrency.getPotentialPrice(this.outputCurrency, this.priceDeviation);
        } else {
            this.price = this.inputCurrency.getPrice(this.outputCurrency, this.priceDeviation);
        }
    }

    setInput(input) {
        this.input = input;
    }

    getOuput() {
        this.priceDeviation = Config.get('priceDeviation') || 0;
        if (Config.get('speculate')) {
            this.output = this.inputCurrency.convertToPotential(this.outputCurrency, this.input, this.priceDeviation)
        } else {
            this.output = this.inputCurrency.convertTo(this.outputCurrency, this.input, this.priceDeviation);
        }
    }

    isRestricted() {
        return !this.inputCurrency.canTrade()
                || !this.outputCurrency.canTrade()
                || !this.market.canTrade();
    }

    calculate(input) {
        this.setInput(input);
        this.getPrice();
        this.getOuput();
    }

    hasEnoughBalance() {
        return Balances.getByCurrency(this.inputCurrency).getAvailable() >= this.input;
    }

    /**
     * Trade the route
     * @returns {undefined}
     */
    async executeTrade() {
        if (Config.get('speculate')) {
            this.trade = this.inputCurrency.tradeToPotential(this.outputCurrency, this.input, this.price, this.priceDeviation);
        } else {
            this.trade = this.inputCurrency.tradeTo(this.outputCurrency, this.input, this.price, this.priceDeviation);
        }
        return await this.trade.execute();
    }
}