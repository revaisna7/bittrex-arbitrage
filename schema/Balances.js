var Config = require('./Config.js');
var Bittrex = require('../bittrex/Bittrex.js');
var Balance = require('./Balance.js');
var Currencies = require('./Currencies.js');
var Util = require('./Util.js');

module.exports = class Balances {

    static list = [];
    static interval;
    static getting = false;

    /**
     * Initialize balances
     * 
     * @returns {undefined}
     */
    static async init() {
        await Balances.get();
        Balances.pulse();
    }

    /**
     * Whether the balances are currently being requested
     * 
     * @returns {Boolean}
     */
    static isGetting() {
        return Balances.getting;
    }

    /**
     * Get balances from bittrex
     * @returns {undefined}
     */
    static async get() {
        Balances.getting = true;
        let balances = await Bittrex.balances();
        Balances.update(balances);
        Balances.getting = false;
    }

    /**
     * (Re)start interval for balances
     * 
     * @returns {undefined}
     */
    static pulse() {
        Balances.pulseStop();
        Balances.pulseStart();
    }

    /**
     * Start interval for balances
     * @returns {undefined}
     */
    static pulseStart() {
        Balances.interval = setInterval(Balances.get, 1000);
    }

    /**
     * Stop interval fro balances
     * @returns {undefined}
     */
    static pulseStop() {
        clearInterval(Balances.interval);
    }

    /**
     * Whether the ballance currency is configured under "currencies"
     * @param {Balance} balance
     * @returns {Boolean}
     */
    static isAllowed(balance) {
        return Config.get('currencies').indexOf(balance.currencySymbol) > -1;
    }

    /**
     * Update balance list with balance response from bittrex
     * 
     * @param {Object} balances
     * @returns {undefined}
     */
    static update(balances) {
        for (var i in balances) {
            if (Balances.isAllowed(balances[i])) {
                var balance = Balances.getByCurrencySymbol(balances[i].currencySymbol);
                if (balance) {
                    balance.update(balances[i]);
                } else {
                    balance = new Balance(balances[i]);
                    Balances.list.push(balance);
                }
            }
        }
    }

    /**
     * Get a balance by a currency
     * 
     * @param {Currency} currency
     * @returns {Balance|null}
     */
    static getByCurrency(currency) {
        for (var i in Balances.list) {
            if (Balances.list[i].currencySymbol === currency.symbol) {
                return Balances.list[i];
            }
        }
        return null;
    }

    /**
     * Get a balance by its currency symbol 'BTC' 'EUR' 'USDT' etc..)
     * 
     * @param {string} symbol
     * @returns {Balance}
     */
    static getByCurrencySymbol(cuurencySymbol) {
        for (var i in Balances.list) {
            if (Balances.list[i].currencySymbol === cuurencySymbol) {
                return Balances.list[i];
            }
        }
        return null;
    }


    /**
     * Returns the accumulated value of all balances converted into the given
     * curreny at current market price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    static accumulate(currency) {
        var value = 0;
        for (var i in Balances.list) {
            value += Balances.list[i].getCurrency().convertTo(currency, Balances.list[i].getTotal());
        }
        return value;
    }

    /**
     * Returns the accumulated value of all balances when the program started
     * converted into the given curreny at current market price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    static accumulateStart(currency) {
        var value = 0;
        for (var i in Balances.list) {
            value += Balances.list[i].getCurrency().convertTo(currency, Balances.list[i].getStartTotal());
        }
        return value;
    }

    /**
     * A total profit factor from the time the program started
     * 
     * @returns {Number}
     */
    static totalProfitFactor() {
        var factor = 0;
        for (var i in Balances.list) {
            factor += Balances.list[i].getProfitFactor();
        }
        return Balances.list.length === 0 ? 0 : factor / Balances.list.length;
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    static consoleOutput() {
        var output = " [Balances]\n Currency\tBalance\t\tTotal\t\tStart\t\tProfit\t\tFactor\t\tBTC balance\tBTC value\tBTC start\tBTC Profit\tBTC factor";
        var balancesOutput = '';
        for (var i in Balances.list) {
            var balance = Balances.list[i];
            balance.setAccumulateNow(Balances.accumulate(balance.getCurrency()));
            balance.setAccumulateStart(Balances.accumulateStart(balance.getCurrency()));
            balancesOutput += balance.consoleOutput();
        }
        return output + "\t [ Overall factor: " + Util.addPlusOrSpace(this.totalProfitFactor()) + "% ]\n" + balancesOutput;
    }

}