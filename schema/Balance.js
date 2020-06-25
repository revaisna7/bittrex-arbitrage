var Config = require('./Config');
var Currencies = require('./Currencies.js');

module.exports = class Balance {
	constructor(balance) {
		Object.assign(this, balance);
		return this;
	}

	isAllowed() {
		return Config.currencies.indexOf(this.Currency) > -1;
	}
}