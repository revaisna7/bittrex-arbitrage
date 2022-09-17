var Model = require('../../system/Model.js');
var Currency = require('./Currency.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var Util = require('../../system/Util.js');

module.exports = class Balance extends Model {

    static list = [];
    static interval;
    static getting = false;

    start = {};
    accumulateStart = 0;
    accumulateNow = 0;
    currencySymbol = '';
    total = 0;
    available = 0;
    updatedAt = null;
    currency = null;

    /**
     * Initialize balances
     * 
     * @returns {undefined}
     */
    static async init() {
        Balance.list = [];
        console.log('Inititialize Balance...');
        await Balance.getAll();
        Balance.pulse();
    }

    /**
     * Whether the balances are currently being requested
     * 
     * @returns {Boolean}
     */
    static isGetting() {
        return Balance.getting;
    }

    /**
     * Get balances from bittrex
     * @returns {undefined}
     */
    static async getAll() {
        Balance.getting = true;
        try {
            let balances = await Bittrex.balances();
            Balance.update(balances);
        } catch (e) {

        }
        Balance.getting = false;
    }

    /**
     * (Re)start interval for balances
     * 
     * @returns {undefined}
     */
    static pulse() {
        Balance.pulseStop();
        Balance.pulseStart();
    }

    /**
     * Start interval for balances
     * @returns {undefined}
     */
    static pulseStart() {
        Balance.interval = setInterval(Balance.getAll, 1000);
    }

    /**
     * Stop interval fro balances
     * @returns {undefined}
     */
    static pulseStop() {
        clearInterval(Balance.interval);
    }

    /**
     * Whether the ballance currency is configured under "currencies"
     * @param {Balance} balance
     * @returns {Boolean}
     */
    static isAllowed(balance) {
        return Currency.getBySymbol(balance.currencySymbol)
                && Currency.getBySymbol(balance.currencySymbol).isAllowed();
    }

    /**
     * Update balance list with balance response from bittrex
     * 
     * @param {Object} balances
     * @returns {undefined}
     */
    static update(balances) {
        Balance.list = [];
        for (var i in balances) {
            var balance = Balance.getByCurrencySymbol(balances[i].currencySymbol);
            var currency = Currency.getBySymbol(balances[i].currencySymbol);
            if (currency.isAllowed()) {
                if (balance) {
                    balance.update(balances[i]);
                } else {
                    balance = new Balance(balances[i]);
                    Balance.list.push(balance);
                }
            }
        }
        var currencies = Currency.getAllowed();
        for (var i in currencies) {
            var balance = Balance.getByCurrencySymbol(currencies[i]);
            if (!balance) {
                balance = new Balance({
                    currencySymbol: currencies[i],
                    total: 0,
                    available: 0,
                    updatedAt: 0
                });
                Balance.list.push(balance);
            }
        }
        for (var i in Balance.list) {
            this.list[i].setAccumulateStart(this.accumulateStart(this.list[i].getCurrency()));
        }
    }

    /**
     * Get a balance by a currency
     * 
     * @param {Currency} currency
     * @returns {Balance|null}
     */
    static getByCurrency(currency) {
        for (var i in Balance.list) {
            if (Balance.list[i].currencySymbol === currency.symbol) {
                return Balance.list[i];
            }
        }
        return null;
    }

    /**
     * Get a balance by its currency symbol 'BTC' 'EUR' 'USDT' etc..)
     * 
     * @param {string} cuurencySymbol
     * @returns {Balance}
     */
    static getByCurrencySymbol(cuurencySymbol) {
        for (var i in Balance.list) {
            if (Balance.list[i].currencySymbol === cuurencySymbol) {
                return Balance.list[i];
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
        for (var i in Balance.list) {
            value += Balance.list[i].getCurrency().convertTo(currency, Balance.list[i].getTotal());
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
        for (var i in Balance.list) {
            value += Balance.list[i].getCurrency().convertTo(currency, Balance.list[i].getStartTotal());
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
        for (var i in Balance.list) {
            factor += Balance.list[i].getProfitFactor();
        }
        return Balance.list.length === 0 ? 0 : factor / Balance.list.length;
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    static consoleOutput() {
        if (Currency.BTC && Currency.USDT) {
            var output = "<h3>Balances</h3><table><tr><th>Currency</th><th>Balance</th><th>Reserved</th><th>Total</th><th>Start</th><th>Profit</th><th>Factor</th><th><img src=\"" + Currency.USDT.logoUrl + "\"> USDT</th><th><img src=\"" + Currency.BTC.logoUrl + "\"> BTC</th></tr>";
            var balancesOutput = '';
            for (var i in Balance.list) {
                Balance.list[i].setAccumulateNow(Balance.accumulate(Balance.list[i].getCurrency()));
                balancesOutput = balancesOutput + "<tr>" + Balance.list[i].consoleOutput() + "</tr>";
            }
            return output + balancesOutput + "</table>";
        }
    }

    /**
     * 
     * @param {type} balance
     * @returns {Balance}
     */
    constructor(balance) {
        super();
        this.update(balance);
        this.startTotal = this.getTotal();
        return this;
    }

    /**
     * 
     * @param {Balance} balance
     * @returns {undefined}
     */
    update(balance) {
        this.currencySymbol = balance.currencySymbol;
        this.total = balance.total;
        this.available = balance.available;
        this.updatedAt = balance.updatedAt;
    }

    /**
     * Whether the ballance is in the confguration list of "currencies"
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return this.getCurrency().isAllowed();
    }

    /**
     * Set current accumulate
     * @param {float} accumulateNow
     * @returns {undefined}
     */
    setAccumulateNow(accumulateNow) {
        this.accumulateNow = accumulateNow;
    }

    /**
     * Set start accumulate
     * @param {float} accumulateStart
     * @returns {undefined}
     */
    setAccumulateStart(accumulateStart) {
        this.accumulateStart = accumulateStart;
    }

    /**
     * Get currency
     * @returns {Currency}
     */
    getCurrency() {
        return Currency.getBySymbol(this.currencySymbol);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getTotal() {
        return Number.parseFloat(this.total);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getStartTotal() {
        return Number.parseFloat(this.startTotal);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getAvailable() {
        return Number.parseFloat(this.available);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getProfit() {
        return this.accumulateNow - this.accumulateStart;
    }

    /**
     * Get total
     * @returns {Number}
     */
    getProfitFactor() {
        return (this.accumulateNow - this.accumulateStart) / this.accumulateStart * 100;
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcStart() {
        return this.getCurrency().convertToBtc(this.accumulateStart);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getUsdtStart() {
        return this.getCurrency().convertToUsdt(this.accumulateStart);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcBalance() {
        return this.getCurrency().convertToBtc(this.getTotal());
    }

    /**
     * Get total
     * @returns {Number}
     */
    getUsdtBalance() {
        return this.getCurrency().convertToUsdt(this.getTotal());
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcNow() {
        return this.getCurrency().convertToBtc(this.accumulateNow);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getUsdtNow() {
        return this.getCurrency().convertToUsdt(this.accumulateNow);
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcProfit() {
        return this.getBtcNow() - this.getBtcStart();
    }

    /**
     * Get total
     * @returns {Number}
     */
    getUsdtProfit() {
        return this.getUsdtNow() - this.getUsdtStart();
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcProfitFactor() {
        return this.getBtcNow() / this.getBtcStart() * 100;
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<td>" + ([
            "<img src=\"" + this.getCurrency().logoUrl + "\"/> " + this.currencySymbol + ""
                    , Util.pad(this.total)
                    , Util.pad(this.total - this.available)
                    , Util.pad(this.accumulateNow)
                    , Util.pad(this.accumulateStart)
                    , Util.addPlusOrSpace(this.getProfit(), 8)
                    , Util.addPlusOrSpace(this.getProfitFactor() ? this.getProfitFactor() : 0) + '%'
                    , Util.pad(this.getUsdtBalance() ? this.getUsdtBalance() : 0)
                    , Util.pad(this.getBtcBalance() ? this.getBtcBalance() : 0)
        ].join("</td><td>")) + "</td>";
    }
}