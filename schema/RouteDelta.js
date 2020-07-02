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
            this.price = this.market.getPotentialPrice(this.outputCurrency, this.priceDeviation);
        } else {
            this.price = this.market.getPrice(this.outputCurrency, this.priceDeviation);
        }
    }

    getInput() {
        this.input = Currencies.getBtc().convertTo(this.inputCurrency, this.route.getInputBtc());
    }

    getOuput() {
        this.priceDeviation = Config.get('priceDeviation') || 0;
        if (Config.get('speculate')) {
            this.output = this.market.convertPotential(this.outputCurrency, this.input, this.price);
        } else {
            this.output = this.market.convert(this.outputCurrency, this.input, this.price);
        }
    }

    isRestricted() {
        return !this.inputCurrency.canTrade()
                || !this.outputCurrency.canTrade()
                || !this.market.canTrade();
    }

    calculate() {
        this.getPrice();
        this.getInput();
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
        this.trade = this.market.trade(this.inputCurrency, this.outputCurrency, this.input, this.price);
        return await this.trade.execute();
    }
}