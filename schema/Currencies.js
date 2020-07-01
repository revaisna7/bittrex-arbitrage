var Config = require('./Config.js');
var Bittrex = require('../bittrex/Bittrex.js');
var Currency = require('./Currency.js');

class Currencies {

    static list = [];

    /**
     * Init currencies
     * @returns {undefined}
     */
    static async init() {
        return this.get();
    }

    /**
     * Get currencies from Bittrex
     * @returns {undefined}
     */
    static async get() {
        let currencies = await Bittrex.currencies();
        for(var i in currencies) {
            var currency = new Currency(currencies[i]);
            Currencies.push(currency);
        }
    }

    /**
     * @returns {Currency}
     */
    static getBtc() {
        return Currency.BTC;
    }

    /**
     * Push a currency to Currencies
     * @param {Currency} currency
     * @returns {undefined}
     */
    static push(currency) {
        Currencies.list.push(currency);
    }

    /**
     * Get a currency by it's code (example: "BTC","USD","USDT")
     * @param {string} symbol
     * @returns {Currency}
     */
    static getBySymbol(symbol) {
        for (var i in Currencies.list) {
            if (Currencies.list[i].symbol === symbol) {
                return Currencies.list[i];
            }
        }
        return null;
    }

}

module.exports = Currencies;