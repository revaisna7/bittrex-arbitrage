var Model = require('../../system/Model.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Delta = require('./Delta.js');
var Util = require('../../system/Util.js');

/**
 * Route logic
 */
module.exports = class Route extends Model {

    static trading = false;

    /**
     * @property {Currency} currencyX 
     */
    currencyX = null;
    
    /**
     * @property {Currency} currencyZ 
     */
    currencyZ = null;
    
    /**
     * @property {Currency} currencyY 
     */
    currencyY = null;

    /**
     * @property {Number} profitFactorX 
     */
    profitFactorX = null;
    
    /**
     * @property {Number} profitFactorX 
     */
    profitFactorY = null;
    
    /**
     * @property {Number} profitFactorX 
     */
    profitFactorZ = null;
    
    /**
     * @property {Number} profitFactorX 
     */
    profitFactor = null;

    /**
     * @property {Array|Delta[]} deltaChain 
     */
    deltaChain = [];

    /**
     * @property {Array|Route[]} list
     */
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
                        var route = Route.possible(currencues[x], currencues[y], currencues[z]);
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
                    routes.push(Route.list[i]);
                }
            }
        }
        return routes;
    }

    static isTrading() {
        return Route.getTradingRoute().length > 0;
    }

    constructor(currencyX, currencyY, currencyZ) {
        super();
        
        this.currencyX = currencyX;
        this.currencyY = currencyY;
        this.currencyZ = currencyZ;

        this.deltaChain.push(new Delta(this, this.currencyX, this.currencyY));
        this.deltaChain.push(new Delta(this, this.currencyY, this.currencyZ));
        this.deltaChain.push(new Delta(this, this.currencyZ, this.currencyX));
    }

    getInputBtc() {
        var minInputBtc = Route.config('inputBtc') || 0.00051;
        var btcBalances = [];
        var minBtcMarkets = [];
        for (var i in this.deltaChain) {
//            btcBalance.push(this.delta[i].getBtcBalance());
            minBtcMarkets.push(this.deltaChain[i].getMinBtcMarket());
        }
//        var minBtcBalance = Math.min(...btcBalances);
        var maxMarketRequirement = Math.max(...minBtcMarkets);

        return Math.max(maxMarketRequirement,minInputBtc);
    }

    calculate() {
        for (var i in this.deltaChain) {
            this.deltaChain[i].calculate();
        }
        this.profitFactorX = (this.deltaChain[2].output - this.deltaChain[0].input) / this.deltaChain[0].input * 100;
        this.profitFactorY = (this.deltaChain[0].output - this.deltaChain[1].input) / this.deltaChain[1].input * 100;
        this.profitFactorZ = (this.deltaChain[1].output - this.deltaChain[2].input) / this.deltaChain[2].input * 100;
        this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;

        if (this.isProfitable()) {
            this.trade();
        }
    }

    isProfitable() {
        if(Route.config('profitAllThree')) {
            return this.profitFactorX >= Route.config('minProfitFactor')
                && this.profitFactorY >= Route.config('minProfitFactor')
                && this.profitFactorZ >= Route.config('minProfitFactor');
        } else {
            return this.profitFactor >= Route.config('minProfitFactor');
        }
    }

    hasEnoughBalance() {
        for (var i in this.deltaChain) {
            if (!this.deltaChain[i].hasEnoughBalance()) {
                return false;
            }
        }
        return true;
    }

    static possible(currencySymbolX, currencySymbolY, currencySymbolZ) {
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
        if (Route.config('trade') && !this.isTrading() && this.hasEnoughBalance()) {
            Route.trading = true;

            for (var i in this.deltaChain) {
                await this.deltaChain[i].executeTrade();
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
        for (var i in this.deltaChain) {
            output += (i > 0 ? ' > ' : '') + this.deltaChain[i].inputCurrency.symbol.padEnd(4);
        }
        output += ' > ' + this.deltaChain[0].inputCurrency.symbol.padEnd(4);
        return output.padEnd(26);
    }

    marketRouteString() {
        var output = Util.spinner();
        for (var i in this.deltaChain) {
            output += (i > 0 ? ' > ' : '') + this.deltaChain[i].market.symbol.padEnd(9);
        }
        return output;
    }

    calculationString() {
        var output = Util.spinner();
        for (var i in this.deltaChain) {
            output += (i > 0 ? ' > ' : ' ') + Util.pad(Number.parseFloat(this.deltaChain[i].input).toFixed(8)) + ' = ' + Util.pad(Number.parseFloat(this.deltaChain[i].output).toFixed(8));
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
        var output = ("<br><br> [Triangular Routes]<br> (" + Route.list.length + ")");
        Route.sort();
        for (var x in Route.list) {
            if (x === 30) break;
            if (typeof Route.list[x] === 'object') {
                output += Route.list[x].consoleOutput() + "<br>";
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