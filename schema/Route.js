var Config = require('./Config.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var RouteDelta = require('./RouteDelta.js');
var Util = require('./Util.js');

/**
 * Route logic
 */
module.exports = class Route {

    static trading = false;

    currencyX = null;
    currencyZ = null;
    currencyY = null;

    profitFactorX = null;
    profitFactorY = null;
    profitFactorZ = null;
    profitFactor = null;

    delta = [];

    constructor(currencyX, currencyY, currencyZ) {
        this.currencyX = currencyX;
        this.currencyY = currencyY;
        this.currencyZ = currencyZ;

        this.delta.push(new RouteDelta(this, this.currencyX, this.currencyY));
        this.delta.push(new RouteDelta(this, this.currencyY, this.currencyZ));
        this.delta.push(new RouteDelta(this, this.currencyZ, this.currencyX));
    }

    getInputBtc() {
        var minInputBtc = Config.get('minInputBtc') || 0.00051;
        var btcBalances = [];
        var minBtcMarkets = [];
        for (var i in this.delta) {
//            btcBalances.push(this.delta[i].getBtcBalance());
            minBtcMarkets.push(this.delta[i].getMinBtcMarket());
        }
//        var minBtcBalance = Math.min(...btcBalances);
        var maxMarketRequirement = Math.max(...minBtcMarkets);

        return Math.max(maxMarketRequirement,minInputBtc);
    }

    calculate() {
        var input = Currencies.getBtc().convertTo(this.currencyX, this.getInputBtc());
        for (var i = 0; i < this.delta.length; i++) {
            if(i > 0) {
                input = this.delta[i-1].output;
            }
            this.delta[i].calculate(input);
        }
        this.profitFactor = (this.delta[2].output - this.delta[0].input) / this.delta[0].input * 100;

        if (this.isProfitable()) {
            this.trade();
        }
    }

    isProfitable() {
        return this.profitFactor >= Config.get('minProfitFactor');
    }

    hasEnoughBalance() {
        for (var i in this.delta) {
            if (!this.delta[i].hasEnoughBalance()) {
                return false;
            }
        }
        return true;
    }

    static find(currencySymbolX, currencySymbolY, currencySymbolZ) {
        var currencyX = Currencies.getBySymbol(currencySymbolX);
        var currencyY = Currencies.getBySymbol(currencySymbolY);
        var currencyZ = Currencies.getBySymbol(currencySymbolZ);
        if (currencyX && currencyY && currencyZ && currencyX.isAllowed() && currencyY.isAllowed() && currencyZ.isAllowed()) {
            var marketX = currencyX.getMarket(currencyY);
            var marketY = currencyY.getMarket(currencyZ);
            var marketZ = currencyZ.getMarket(currencyX);
            if (marketX && marketY && marketZ && marketX.isAllowed() && marketY.isAllowed() && marketZ.isAllowed()) {
                return new Route(currencyX, currencyY, currencyZ);
            }
        }
    }

    /**
     * Trade the route
     * @returns {undefined}
     */
    async trade() {
        if (Config.get('trade') && !this.isTrading() && this.hasEnoughBalance()) {
            Route.trading = true;

            for (var i in this.delta) {
                await this.delta[i].executeTrade();
            }
            await Balances.get();

            Route.trading = false;
        }
    }

    /**
     * Whether there is currently a route trading
     * @returns {Boolean}
     */
    isTrading() {
        return Route.trading;
    }

    currencyRouteString() {
        return this.currencyX.symbol + (this.currencyX.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyY.symbol + (this.currencyY.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyZ.symbol + (this.currencyZ.symbol.length < 4 ? ' ' : '') + ' > '
                + this.currencyX.symbol + (this.currencyX.symbol.length < 4 ? ' ' : '');
    }

    currencyRouteString() {
        var output = '';
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : ' ') + this.delta[i].inputCurrency.symbol + (this.delta[i].inputCurrency.symbol < 4 ? ' ' : '')
        }
        output += ' > ' + this.delta[0].inputCurrency.symbol + (this.delta[0].inputCurrency.symbol < 4 ? ' ' : '')
        return output;
    }

    marketRouteString() {
        var output = '';
        for (var i in this.delta) {
            output += this.delta[i].market.symbol + (this.delta[i].market.symbol.length < 8 ? '  ' : (this.delta[i].market.symbol.length < 9 ? ' ' : ''))
        }
        return output;
    }

    calculationString() {
        var output = '';
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : ' ') + Util.pad(Number.parseFloat(this.delta[i].input).toFixed(8)) + ' = ' + Util.pad(Number.parseFloat(this.delta[i].output).toFixed(8));
        }
        return output;
    }

    profitString() {
        return "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactor).toFixed(4)) + '%'
                + "\t" + (this.hasEnoughBalance() ? "" : "No balance");
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return this.ouput = ' [' + new Date().toLocaleTimeString() + '] '
                + this.currencyRouteString()
                + "\t" + this.marketRouteString()
                + "\t" + this.calculationString()
                + "\t" + this.profitString();
    }
}