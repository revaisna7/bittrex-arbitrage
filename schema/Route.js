var Config = require('./Config.js');
var Balances = require('./Balances.js');
var Currencies = require('./Currencies.js');
var Delta = require('./Delta.js');
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

        this.delta.push(new Delta(this, this.currencyX, this.currencyY));
        this.delta.push(new Delta(this, this.currencyY, this.currencyZ));
        this.delta.push(new Delta(this, this.currencyZ, this.currencyX));
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
        for (var i in this.delta) {
            this.delta[i].calculate();
        }
        this.profitFactorX = (this.delta[2].output - this.delta[0].input) / this.delta[0].input * 100;
        this.profitFactorY = (this.delta[0].output - this.delta[1].input) / this.delta[1].input * 100;
        this.profitFactorZ = (this.delta[1].output - this.delta[2].input) / this.delta[2].input * 100;
        this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;

        if (this.isProfitable()) {
            this.trade();
        }
    }

    isProfitable() {
        if(Config.get('profitAllThree')) {
            return this.profitFactorX >= Config.get('minProfitFactor')
                && this.profitFactorY >= Config.get('minProfitFactor')
                && this.profitFactorZ >= Config.get('minProfitFactor');
        } else {
            return this.profitFactor >= Config.get('minProfitFactor');
        }
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
        var output = ' ';
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : '') + this.delta[i].inputCurrency.symbol + (this.delta[i].inputCurrency.symbol === 3 ? ' ' : '');
        }
        output += ' > ' + this.delta[0].inputCurrency.symbol + (this.delta[0].inputCurrency.symbol === 3 ? ' ' : '')
        return output;
    }

    marketRouteString() {
        var output = "  ";
        for (var i in this.delta) {
            output += this.delta[i].market.symbol + (this.delta[i].market.symbol.length < 8 ? '  ' : (this.delta[i].market.symbol.length < 9 ? ' ' : ''))
        }
        return output;
    }

    calculationString() {
        var output = '  ';
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : ' ') + Util.pad(Number.parseFloat(this.delta[i].input).toFixed(8)) + ' = ' + Util.pad(Number.parseFloat(this.delta[i].output).toFixed(8));
        }
        return output;
    }

    profitString() {
        return "\t" + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX).toFixed(4)) + '%'
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
                + this.currencyRouteString()
                + " " + this.marketRouteString()
                + " " + this.calculationString()
                + " " + this.profitString();
    }
}