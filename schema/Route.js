var Config = require('./Config.js');
var Markets = require('./Markets.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Currency = require('./Currency.js');
var Trade = require('./Trade.js');
var Util = require('./Util.js');

/**
 * Route logic
 */
module.exports = class Route {

    static trading = false;

    balanceX = null;
    balanceY = null;
    balanceZ = null;

    btcBalanceX = null;
    btcBalanceY = null;
    btcBalanceZ = null;

    minBtcMarketX = null;
    minBtcMarketY = null;
    minBtcMarketZ = null;

    currencyX = null;
    currencyZ = null;
    currencyY = null;

    marketX = null;
    marketY = null;
    marketZ = null;

    tradeX = null;
    tradeY = null;
    tradeZ = null;

    isXBase = null;
    isYBase = null;
    isZBase = null;

    inputX = null;
    inputY = null;
    inputZ = null;

    outputX = null;
    outputY = null;
    outputZ = null;

    priceX = null;
    priceY = null;
    pticeZ = null;

    profitFactorX = null;
    profitFactorY = null;
    profitFactorZ = null;
    profitFactor = null;

    minInputBtc = null;
    priceDeviation = null;
    speculate = null;

    constructor(currencyX, currencyY, currencyZ, marketX, marketY, marketZ) {
        this.currencyX = currencyX;
        this.currencyY = currencyY;
        this.currencyZ = currencyZ;
        this.marketX = marketX;
        this.marketY = marketY;
        this.marketZ = marketZ;
        this.marketX.routes.push(this);
        this.marketY.routes.push(this);
        this.marketZ.routes.push(this);
        this.isXBase = this.marketX.isBaseCurrency(this.currencyX);
        this.isYBase = this.marketY.isBaseCurrency(this.currencyY);
        this.isZBase = this.marketZ.isBaseCurrency(this.currencyZ);
        this.getBalances();
    }

    getInputs() {
        this.getBalances();
        
        this.priceDeviation = this.priceDeviation || Config.get('priceDeviation') || 0;
        this.speculate = this.speculate || Config.get('speculate') || false;
        this.minInputBtc = this.minInputBtc || Config.get('minInputBtc') || 0.00055;
        
        // deviated prices
        this.priceX = this.speculate ? this.marketX.getPotentialPrice(this.currencyY, this.priceDeviation) : this.marketX.getPrice(this.currencyY, this.priceDeviation);
        this.priceY = this.speculate ? this.marketY.getPotentialPrice(this.currencyZ, this.priceDeviation) : this.marketY.getPrice(this.currencyZ, this.priceDeviation);
        this.priceZ = this.speculate ? this.marketZ.getPotentialPrice(this.currencyX, this.priceDeviation) : this.marketZ.getPrice(this.currencyX, this.priceDeviation);

        // currency btc size
        this.btcBalanceX = this.currencyX.convertToBtc(this.balanceX.getTotal());
        this.btcBalanceY = this.currencyY.convertToBtc(this.balanceY.getTotal());
        this.btcBalanceZ = this.currencyZ.convertToBtc(this.balanceZ.getTotal());

        // min allowed maket size
        this.minBtcMarketX = Currencies.getBySymbol(this.marketX.baseCurrencySymbol).convertToBtc(this.marketX.getMinTradeSize());
        this.minBtcMarketY = Currencies.getBySymbol(this.marketY.baseCurrencySymbol).convertToBtc(this.marketY.getMinTradeSize());
        this.minBtcMarketZ = Currencies.getBySymbol(this.marketZ.baseCurrencySymbol).convertToBtc(this.marketZ.getMinTradeSize());

        // minimumums
        this.minBtcMarket = Math.max(this.minBtcMarketX, this.minBtcMarketY, this.minBtcMarketZ);
        this.maxBtcBalance = Math.max(this.btcBalanceX, this.btcBalanceY, this.btcBalanceZ);
        this.minBtcBalance = Math.min(this.btcBalanceX, this.btcBalanceY, this.btcBalanceZ);

        // max of minimum
        this.inputBtc = Math.max(this.minBtcBalance, this.minInputBtc);

        this.inputX = Currencies.getBtc().convertTo(this.currencyX, this.minBtcMarket);
        this.inputY = Currencies.getBtc().convertTo(this.currencyY, this.minBtcMarket);
        this.inputZ = Currencies.getBtc().convertTo(this.currencyZ, this.minBtcMarket);

        // get final outputs
        this.getOuputs();
    }

    getOuputs() {
        this.outputX = this.speculate ? this.currencyX.convertToPotential(this.currencyY, this.inputX, this.priceDeviation) : this.currencyX.convertTo(this.currencyY, this.inputX, this.priceDeviation);
        this.outputY = this.speculate ? this.currencyY.convertToPotential(this.currencyZ, this.inputY, this.priceDeviation) : this.currencyY.convertTo(this.currencyZ, this.inputY, this.priceDeviation);
        this.outputZ = this.speculate ? this.currencyZ.convertToPotential(this.currencyX, this.inputZ, this.priceDeviation) : this.currencyZ.convertTo(this.currencyX, this.inputZ, this.priceDeviation);
    }

    isRestricted() {
        return !this.currencyX.canTrade()
                || !this.currencyY.canTrade()
                || !this.currencyZ.canTrade()
                || !this.marketX.canTrade()
                || !this.marketY.canTrade()
                || !this.marketZ.canTrade();
    }

    getBalances() {
        this.balanceX = Balances.getByCurrency(this.currencyX);
        this.balanceY = Balances.getByCurrency(this.currencyY);
        this.balanceZ = Balances.getByCurrency(this.currencyZ);
    }

    calculate() {
        this.getInputs();
        this.getOuputs();
        this.calculateProfit();

        if (this.isProfitable() && this.hasEnoughBalance() && !this.isTrading()) {
            this.trade();
        }
    }

    calculateProfit() {
        this.profitFactorX = (this.outputZ - this.inputX) / this.inputX * 100;
        this.profitFactorY = (this.outputX - this.inputY) / this.inputY * 100;
        this.profitFactorZ = (this.outputY - this.inputZ) / this.inputZ * 100;
        this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;
    }

    isProfitable() {
        if (Config.get('profitAllThree')) {
            return this.profitFactorX > Config.get('minProfitFactor')
                    && this.profitFactorY > Config.get('minProfitFactor')
                    && this.profitFactorZ > Config.get('minProfitFactor')
                    && this.profitFactorX < Config.get('maxProfitFactor')
                    && this.profitFactorZ < Config.get('maxProfitFactor')
                    && this.profitFactorY < Config.get('maxProfitFactor');
        } else {
            return this.profitFactor > Config.get('minProfitFactor');
        }
    }

    hasEnoughBalance() {
        return this.balanceX.getTotal() >= this.inputX
                && this.balanceY.getTotal() >= this.inputY
                && this.balanceZ.getTotal() >= this.inputZ;
    }

    awaitingTrades() {
        return this.tradeX
                && this.tradeY
                && this.tradeZ
                && this.tradeX.requested
                && !this.tradeX.responeded
                && this.tradeY.requested
                && !this.tradeY.responeded
                && this.tradeZ.requested
                && !this.tradeZ.responeded;
    }

    static find(currencySymbolX, currencySymbolY, currencySymbolZ) {
        var currencyX = Currencies.getBySymbol(currencySymbolX);
        var currencyY = Currencies.getBySymbol(currencySymbolY);
        var currencyZ = Currencies.getBySymbol(currencySymbolZ);
        if (currencyX
                && currencyY
                && currencyZ
                && currencyX.isAllowed()
                && currencyY.isAllowed()
                && currencyZ.isAllowed()
                ) {
                var marketX = Markets.getByCurrencies(currencyX, currencyY);
                var marketY = Markets.getByCurrencies(currencyY, currencyZ);
                var marketZ = Markets.getByCurrencies(currencyZ, currencyX);
                if (marketX
                    && marketY
                    && marketZ
                    && marketX.isAllowed()
                    && marketY.isAllowed()
                    && marketZ.isAllowed()
                    ) {
                    return new Route(currencyX, currencyY, currencyZ, marketX, marketY, marketZ);
            }
        }
    }

    trade() {
        if (Config.get('trade')) {
            Route.trading = true;

            this.tradeX = this.currencyX.tradeTo(this.currencyY, this.isXBase ? this.outputX : this.inputX, this.priceX).execute();
            this.tradeY = this.currencyY.tradeTo(this.currencyZ, this.isYBase ? this.outputY : this.inputY, this.priceY).execute();
            this.tradeZ = this.currencyZ.tradeTo(this.currencyX, this.isZBase ? this.outputZ : this.inputZ, this.priceZ).execute();

            Balances.pulse();
            setTimeout(function () {
                Route.trading = false;
            }, 5000);
        }
    }

    isTrading() {
        return Route.trading;
    }

    routeString() {
        return this.currencyX.symbol + (this.currencyX.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyY.symbol + (this.currencyY.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyZ.symbol + (this.currencyZ.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyX.symbol + (this.currencyX.symbol.length < 4 ? ' ' : '');
    }

    marketRouteString() {
        return this.marketX.symbol + (this.marketX.symbol.length < 8 ? '  ' : (this.marketX.symbol.length < 9 ? ' ' : '')) + ' > '
                + this.marketY.symbol + (this.marketY.symbol.length < 8 ? '  ' : (this.marketY.symbol.length < 9 ? ' ' : '')) + ' > '
                + this.marketZ.symbol + (this.marketZ.symbol.length < 8 ? '  ' : (this.marketZ.symbol.length < 9 ? ' ' : ''));
    }

    calculationString() {
        return Util.pad(Number.parseFloat(this.inputX).toFixed(8))
                + ' = ' + Util.pad(Number.parseFloat(this.outputX).toFixed(8))
                + " > " + Util.pad(Number.parseFloat(this.inputY).toFixed(8))
                + ' = ' + Util.pad(Number.parseFloat(this.outputY).toFixed(8))
                + " > " + Util.pad(Number.parseFloat(this.inputZ).toFixed(8))
                + ' = ' + Util.pad(Number.parseFloat(this.outputZ).toFixed(8))
                + "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX).toFixed(4)) + '%'
                + " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorY).toFixed(4)) + '%'
                + " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorZ).toFixed(4)) + '%'
                + "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactor).toFixed(4)) + '%'
                + "\t" + (this.hasEnoughBalance() ? "" : "No balance");
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return this.ouput = ' [' + new Date().toLocaleTimeString() + '] '
                + this.routeString()
                + "\t" + this.marketRouteString()
                + "\t" + this.calculationString();
    }
}