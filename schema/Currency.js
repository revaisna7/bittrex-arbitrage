var Config = require('./Config.js');

module.exports = class Currency {

    static BTC;
    static BASE;

    symbol = '';
    name = '';
    coinType = '';
    status = '';
    minConfirmations = 0;
    notice = '';
    txFee = 0;
    logoUrl = '';
    prohibitedIn = [];
    markets = [];

    /**
     * Insantiate a new currency
     * 
     * @param {Object} currency Bittrex currency response object
     * @returns {Currency}
     */
    constructor(currency) {
        Object.assign(this, currency);

        if (this.isBtc()) {
            Currency.BTC = this;
        }
        if (this.isBtc()) {
            Currency.BASE = this;
        }

        return this;
    }

    addMarket(market) {
        this.markets.push(market);
    }

    getMarketBySymbol(marketSymbol) {
        for (var i in this.markets) {
            if (this.markets[i].symbol === marketSymbol) {
                return this.markets[i];
            }
        }
        return false;
    }

    getMarket(currency) {
        return this.getMarketBySymbol(this.symbol + '-' + currency.symbol)
                || this.getMarketBySymbol(currency.symbol + '-' + this.symbol);
    }

    isRestricted() {
        return Config.get('restricted').indexOf(this.symbol) > -1;
    }

    isAllowed() {
        return Config.get('currencies').indexOf(this.symbol) > -1;
    }

    isOnline() {
        return this.statuc === 'ONLINE';
    }

    canTrade() {
        return this.isAllowed()
                && !this.isRestricted()
                && this.isOnline();
    }

    isBtc() {
        return this.symbol === 'BTC';
    }
    
    isBase() {
        return this.symbol === Config.get('base');
    }

    getSymbol() {
        return this.symbol;
    }

    getName() {
        return this.name;
    }

    getPrice(currency, priceDeviation) {
        return this.getMarket(currency).getPrice(currency, priceDeviation);
    } 
    
    getPotentialPrice(currency, priceDeviation) {
        return this.getMarket(currency).getPrice(currency, priceDeviation);
    } 

    convertToBtc(inputQuantity, deviaiton) {
        return this.isBtc() ? inputQuantity : this.convertTo(Currency.BTC, inputQuantity, deviaiton);
    }

    convertToPotentialBtc(inputQuantity, deviaiton) {
        return this.isBtc() ? inputQuantity : this.convertToPotential(Currency.BTC, inputQuantity, deviaiton);
    }

    convertThroughBtc(outputCurrency, inputQuantity, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var marketX = this.getMarket(Currency.BTC);
        var marketY = Currency.BTC.getMarket(outputCurrency);
        return marketX && marketY ? Currency.BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity, deviaiton), deviaiton) : false;
    }

    convertPotentialThroughBtc(outputCurrency, inputQuantity, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var marketX = this.getMarket(Currency.BTC);
        var marketY = Currency.BTC.getMarket(outputCurrency);
        return marketX && marketY ? Currency.BTC.convertToPotential(outputCurrency, this.convertToBtc(inputQuantity, deviaiton), deviaiton) : false;
    }

    convertStraight(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convert(outputCurrency, inputQuantity, price, deviaiton) : false;
    }

    convertPotential(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convertPotential(outputCurrency, inputQuantity, price, deviaiton) : false;
    }

    convertTo(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        return this.convertStraight(outputCurrency, inputQuantity, price, deviaiton)
                || this.convertThroughBtc(outputCurrency, inputQuantity, price, deviaiton);
    }

    convertToPotential(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        return this.convertPotential(outputCurrency, inputQuantity, price, deviaiton)
                || this.convertPotentialThroughBtc(outputCurrency, inputQuantity, deviaiton);
    }

    tradeToBtc(inputQuantity, price, deviaiton) {
        return this === Currency.BTC ? null : this.tradeTo(Currency.BTC, inputQuantity, price, deviaiton);
    }

    tradeThroughBtc(outputCurrency, inputQuantity, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return;

        var marketX = this.getMarket(Currency.BTC);
        var marketY = Currency.BTC.getMarket(outputCurrency);
        return marketX && marketY ? Currency.BTC.tradeTo(outputCurrency, this.tradeToBtc(inputQuantity, deviaiton), deviaiton) : false;
    }

    tradeStraight(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return;

        var market = this.getMarket(outputCurrency);
        return market ? market.trade(this, outputCurrency, inputQuantity, price, deviaiton) : false;
    }
    
    tradePotential(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return;

        var market = this.getMarket(outputCurrency);
        return market ? market.tradePotential(this, outputCurrency, inputQuantity, price, deviaiton) : false;
    }

    tradeTo(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return;

        return this.tradeStraight(outputCurrency, inputQuantity, price, deviaiton)
                || this.tradeThroughBtc(outputCurrency, inputQuantity, deviaiton);
    }
    
    tradeToPotential(outputCurrency, inputQuantity, price, deviaiton) {
        if (this.symbol === outputCurrency.symbol)
            return;

        return this.tradePotential(outputCurrency, inputQuantity, price, deviaiton)
                || this.tradeThroughBtc(outputCurrency, inputQuantity, deviaiton);
    }

}