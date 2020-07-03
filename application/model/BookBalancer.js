var Config = require('./Config.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

var bittrexv3 = require('bittrex-node-api');

var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Currencies = require('./Currency.js');
var Routes = require('./Route.js');
var Util = require('../lib/Util.js');

module.exports = class BookBalancer {

    static consoleOutput() {
        
    }

}