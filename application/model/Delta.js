var Model = require('../../system/Model.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');

module.exports = class Delta extends Model {

    static trading = false;

    route = null;
    inputCurrency = null;
    outputCurrency = null;
    input = null;
    output = null;
    price = 0;

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
        if (this.getMode() === 'market') {
            this.price = this.market.getMarketPrice(this.outputCurrency);
        }
        if (this.getMode() === 'potential') {
            this.price = this.market.getPotentialPrice(this.outputCurrency);
        }
        if (this.getMode() === 'median') {
            this.price = this.market.getMedianPrice(this.outputCurrency);
        }
        if (this.getMode() === 'last') {
            this.price = this.market.getLastPrice(this.outputCurrency);
        }
        if (this.getMode() === 'fixed') {
            this.price = this.market.getMarketPrice(this.outputCurrency);
        }
        
        return this.price = Number.parseFloat(this.price).toFixed(8);
    }

    getInput() {
        return this.input = Currency.getBtc().convertTo(this.inputCurrency, this.route.getInputBtc());
    }

    getOuput() {
        if(this.price === 0) {
            this.price = this.getPrice();
        }
        if(this.getMode() === 'market') {
            this.output = this.market.convert(this.outputCurrency, this.getInput(), this.price);
            this.output = this.output - (this.output*this.market.takerFee);
        }
        if (this.getMode() === 'potential') {
            this.output = this.market.convertPotential(this.outputCurrency, this.getInput(), this.price);
            this.output = this.output - (this.output*this.market.makerFee);
        }
        if(this.getMode() === 'median') {
            this.output = this.market.convertMedian(this.outputCurrency, this.getInput(), this.price);
            this.output = this.output - (this.output*this.market.makerFee);
        }
        if(this.getMode() === 'last') {
            this.output = this.market.convertLast(this.outputCurrency, this.getInput(), this.price);
            this.output = this.output - (this.output*this.market.makerFee);
        }
        if(this.getMode() === 'fixed') {
            this.output = this.market.convertPotential(this.outputCurrency, this.getInput(), this.price);
            this.output = this.output - (this.output*this.market.makerFee);
        }
        return this.output;
    }

    getMode() {
        return Delta.config('mode');
    }

    isRestricted() {
        return !this.inputCurrency.canTrade()
                || !this.outputCurrency.canTrade()
                || !this.market.canTrade();
    }

    calculate() {
        this.price = 0;
        this.getOuput();
    }

    recalculate() {
        this.output = this.market.convert(this.outputCurrency, this.getInput(), this.price);
        this.output -= this.output*this.market.makerFee;
    }

    fixPrices(factor) {
        if(factor < 0) {
            var fix = Delta.config('fix') || 0;
            if (this.market.isBaseCurrency(this.inputCurrency)) {
               this.price = Number.parseFloat(this.price) - Number.parseFloat(this.price/100*(factor-fix));
            } else {
               this.price = Number.parseFloat(this.price) + Number.parseFloat(this.price/100*(factor-fix));
            }
        }
        this.price = Number.parseFloat(this.price).toFixed(8);
    }

    hasEnoughBalance() {
        return Balance.getByCurrency(this.inputCurrency).getAvailable() >= this.input;
    }

    /**
     * Trade the route
     * @returns {undefined}
     */
    trade() {
        var trade = this.market.trade(this.inputCurrency, this.outputCurrency, this.getInput(), this.price);
        return trade;
    }
};