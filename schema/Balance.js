var Config = require('./Config.js');
var Currencies = require('./Currencies.js');
var Util = require('./Util.js');

module.exports = class Balance {

    start = {};
    accumulateStart = 0;
    accumulateNow = 0;
    currencySymbol = '';
    total = 0;
    available = 0;
    updatedAt = null;
    currency = null;

    /**
     * 
     * @param {type} balance
     * @returns {Balance}
     */
    constructor(balance) {
        this.update(balance);
        this.startTotal = this.getTotal();
        return this;
    }

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
        return Config.get('currencies').indexOf(this.currencySymbol) > -1;
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
        return Currencies.getBySymbol(this.currencySymbol);
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
        return this.accumulateStart - this.accumulateNow;
    }

    /**
     * Get total
     * @returns {Number}
     */
    getProfitFactor() {
        return (this.accumulateStart - this.accumulateNow) / this.accumulateStart * 100;
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
    getBtcBalance() {
        return this.getCurrency().convertToBtc(this.getTotal());
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
    getBtcProfit() {
        return this.getBtcNow() - this.getBtcStart();
    }

    /**
     * Get total
     * @returns {Number}
     */
    getBtcProfitFactor() {
        return this.getBtcProfit() / this.getBtcStart() * 100;
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return [
            " [" + this.currencySymbol + "]\t"
                , Util.pad(this.total)
                , Util.pad(this.accumulateNow)
                , Util.pad(this.accumulateStart)
                , Util.addPlusOrSpace(this.getProfit(), 8)
                , Util.addPlusOrSpace(this.getProfitFactor()) + '%'
                , Util.pad(this.getBtcBalance())
                , Util.pad(this.getBtcNow())
                , Util.pad(this.getBtcStart())
                , Util.addPlusOrSpace(this.getBtcProfit(), 8)
                , Util.addPlusOrSpace(this.getBtcProfitFactor()) + '%'
        ].join("\t") + "\n";
    }
}