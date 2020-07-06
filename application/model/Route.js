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
        var currencies = Currency.getAllowed();
        for (var x in currencies) {
            for (var y in currencies) {
                if (x === y)
                    continue;
                for (var z in currencies) {
                    if (y === z || z === x)
                        continue;
                    if (!Route.exists(currencies[x], currencies[y], currencies[z])) {
                        var route = Route.possible(currencies[x], currencies[y], currencies[z]);
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

        return Math.max(maxMarketRequirement, minInputBtc);
    }

    calculate() {
        for (var i in this.deltaChain) {
            this.deltaChain[i].calculate();
        }
        this.profitX = (this.deltaChain[2].output - this.deltaChain[0].input);
        this.profitY = (this.deltaChain[0].output - this.deltaChain[1].input);
        this.profitZ = (this.deltaChain[1].output - this.deltaChain[2].input);
        this.profitFactorX = (this.profitX) / this.deltaChain[0].input * 100;
        this.profitFactorY = (this.profitY) / this.deltaChain[1].input * 100;
        this.profitFactorZ = (this.profitZ) / this.deltaChain[2].input * 100;
        this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;

        if (this.isProfitable()) {
            this.trade();
        }
    }

    isProfitable() {
        if (Route.config('profitAllThree')) {
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
            await Balance.getAll();
            setTimeout(() => {
                Route.trading = false;
            }, Route.config('nextTradeTimeout'));
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
        var output;
        for (var i in this.deltaChain) {
            output += this.deltaChain[i].inputCurrency.symbol;
        }
        output += ' > ' + this.deltaChain[0].inputCurrency.symbol;
        return output;
    }

    marketRouteString() {
        var output;
        for (var i in this.deltaChain) {
            output += this.deltaChain[i].market.symbol;
        }
        return output;
    }

    currencyTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + "<img src=\"" + this.currencyX.logoUrl + "\" />"
                + "</td>"
                + "<td>"
                + this.currencyX.symbol
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + "<img src=" + this.currencyY.logoUrl + " />"
                + "</td>"
                + "<td>"
                + this.currencyY.symbol
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + "<img src=" + this.currencyZ.logoUrl + " />"
                + "</td>"
                + "<td>"
                + this.currencyZ.symbol
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    inputTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[0].input))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[1].input))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[2].input))
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    outputTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[2].output))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[0].output))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[1].output))
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    profitTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitX), 8)
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitY), 8)
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitZ), 8)
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    profitFactorTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX), 3) + "%"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorY), 3) + "%"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorZ), 3) + "%"
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    static consoleOutput() {
        var output = "<h3>Triangular Routes (" + Route.list.length + ") " + new Date().toLocaleString() + "</h3>"
                + "<table>"
                + "<tr>"
                + "<th>Exchange</th>"
                + "<th>Type</th>"
                + "<th>Currency</th>"
                + "<th>Input</th>"
                + "<th>Output</th>"
                + "<th>Profit</th>"
                + "<th>Profit Factor</th>"
                + "<th>Net Profit</th>"
                + "</tr>";
        Route.sort();
        for (var x in Route.list) {
            if (x === 30)
                break;
            if (typeof Route.list[x] === "object") {
                output += Route.list[x].consoleOutput();
            }
        }
        return output + "</table>";
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<tr>"
                + "<td>Bittrex</td>"
                + "<td>" + (Delta.config("speculate") ? "speculative" : "instant") + "</td>"
                + "<td>" + this.currencyTable() + "</td>"
                + "<td>" + this.inputTable() + "</td>"
                + "<td>" + this.outputTable() + "</td>"
                + "<td>" + this.profitTable() + "</td>"
                + "<td>" + this.profitFactorTable() + "</td>"
                + "<td>" + Util.addPlusOrSpace(this.profitFactor) + "%</td>"
                + "</tr>";
    }
};