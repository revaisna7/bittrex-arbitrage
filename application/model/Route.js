var Config = require('./Config.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Delta = require('./Delta.js');
var Util = require('../lib/Util.js');

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

    static list = [];
    static finding = false;

    static init() {
        this.find();
    }

    static find() {
        this.finding = true;
        var currencues = Currency.getAllowed();
        for (var x in currencues) {
            for (var y in currencues) {
                if (x === y) continue;
                for (var z in currencues) {
                    if (y === z || z === x) continue;
                    if (!Route.exists(currencues[x], currencues[y], currencues[z])) {
                        var route = Route.find(currencues[x], currencues[y], currencues[z]);
                        if (route) {
                            Route.push(route);
                        }
                    }
                }
            }
        }
        this.finding = false;
    }

    static push(route) {
        Route.list.push(route);
    }

    static exists(currencyX, currencyY, currencyZ) {
        for (var i in Route.list) {
            if (Route.list[i].currencyX === currencyX
                    && Route.list[i].currencyY === currencyY
                    && Route.list[i].currencyZ === currencyZ) {
                return true;
            }
        }
        return false;
    }

    static sort() {
        Route.list.sort(Route.sortComparer);
    }

    static sortComparer(a, b) {
        if (a.profitFactor > b.profitFactor)
            return -1;
        if (a.profitFactor < b.profitFactor)
            return 1;
        return 0;
    }

    static getTradingRoute() {
        var routes = [];
        for (var i in Route.list) {
            if (Route.list[i] instanceof Route) {
                if (Route.list[i].isTrading()) {
                    Route.push(Route.list[i]);
                }
            }
        }
        return routes;
    }

    static isTrading() {
        return Route.getTradingRoute().length > 0;
    }

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
//            btcBalance.push(this.delta[i].getBtcBalance());
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
        var currencyX = Currency.getBySymbol(currencySymbolX);
        var currencyY = Currency.getBySymbol(currencySymbolY);
        var currencyZ = Currency.getBySymbol(currencySymbolZ);
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
            await Balance.get();

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
        var output = Util.spinner();
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : '') + this.delta[i].inputCurrency.symbol.padEnd(4);
        }
        output += ' > ' + this.delta[0].inputCurrency.symbol.padEnd(4);
        return output.padEnd(26);
    }

    marketRouteString() {
        var output = Util.spinner();
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : '') + this.delta[i].market.symbol.padEnd(9);
        }
        return output;
    }

    calculationString() {
        var output = Util.spinner();
        for (var i in this.delta) {
            output += (i > 0 ? ' > ' : ' ') + Util.pad(Number.parseFloat(this.delta[i].input).toFixed(8)) + ' = ' + Util.pad(Number.parseFloat(this.delta[i].output).toFixed(8));
        }
        return output;
    }

    profitString() {
        return Util.spinner() + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX).toFixed(4)) + '%'
                + " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorY).toFixed(4)) + '%'
                + " " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorZ).toFixed(4)) + '%'
                + " ~ " + Util.addPlusOrSpace(Number.parseFloat(this.profitFactor).toFixed(4)) + '%'
                + "  " + (this.hasEnoughBalance() ? "" : "No balance");
    }

    static consoleOutput() {
        var output = ("\n\n [Triangular Route]\n");
        Route.sort();
        for (var x in Route.list) {
            if (x === 30) break;
            if (typeof Route.list[x] === 'object') {
                output += Route.list[x].consoleOutput() + "\n";
            }
        }
        return output;
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return this.ouput = ' ' + new Date().toLocaleTimeString()
                + this.currencyRouteString()
                + this.marketRouteString()
                + this.calculationString()
                + this.profitString();
    }
}