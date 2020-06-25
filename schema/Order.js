var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.values.bittrexoptions);

var Currencies = require('./Currencies.js');

module.exports = class Order {
	constructor(balance) {
		Object.assign(this, balance);
		return this;
	}

	isAllowed() {
		return Config.get('currencies').indexOf(this.Currency) > -1;
	}
}