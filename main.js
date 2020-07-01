console.log('Initiating...');
var Config = require('./schema/Config.js');
Config.init();

var Markets = require('./schema/Markets.js');
var Routes = require('./schema/Routes.js');
var Currencies = require('./schema/Currencies.js');
var Balances = require('./schema/Balances.js');
var Orders = require('./schema/Orders.js');
var View = require('./schema/View.js');

(async () => {


    console.log('Initializing Currencies...');
    await Currencies.init();
    
    console.log('Initializing Markets...');
    await Markets.init();

    console.log('Initializing Balances...');
    await Balances.init();

    console.log('Initializing Orders...');
    await Orders.init();

    setTimeout(() => {
        console.log('Initializing Routes...');
        Routes.init();
    }, 10000);

    setTimeout(() => {
        console.log('Initializing View...');
        View.init();
    }, 10000);
})();