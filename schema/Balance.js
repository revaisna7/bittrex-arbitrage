var Config = require('./Config.js');
var Currencies = require('./Currencies.js');

module.exports = class Balance {
	constructor(balance) {
		Object.assign(this, balance);
		return this;
	}

	isAllowed() {
		return Config.values.currencies.indexOf(this.Currency) > -1;
	}
}