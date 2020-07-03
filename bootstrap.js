console.log('Initiating...');
var Config = require('./model/Config.js');
Config.init();

var Market = require('./model/Market.js');
var OrderBook = require('./model/OrderBook.js');
var Route = require('./model/Route.js');
var Currency = require('./model/Currency.js');
var Balance = require('./model/Balance.js');
var Orders = require('./model/Order.js');
var View = require('./model/View.js');



(async () => {


    console.log('Initializing Currency...');
    await Currency.init();
    
    console.log('Initializing Market...');
    await Market.init();
    
    console.log('Initializing Order books...');
    await OrderBook.init();

    console.log('Initializing Order...');
    await Order.init();

    console.log('Initializing Balance...');
    await Balance.init();

    setTimeout(() => {
        console.log('Initializing Route...');
        Route.init();
    }, 10000);

    setTimeout(() => {
        console.log('Initializing View...');
        View.init();
    }, 10000);
})();