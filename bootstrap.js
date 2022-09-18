console.log("Inititializing config");
var Configurable = require('./system/Configurable.js');
Configurable.initConfig();


setTimeout(() => {
    // init web server
    var WebServer = require('./system/WebServer.js');
    var SocketServer = require('./system/SocketServer.js');
    var ArbitrageController = require('./application/controller/ArbitrageController.js');
    var Bittrex = require('./exchange/bittrex/Bittrex.js');

    console.log("Initializing webserver");
    WebServer.init();

    console.log("Initializing socketserver");
    SocketServer.init();
    
    if(Bittrex.config('apikey') && Bittrex.config('apisecret')) {
        ArbitrageController.Arbitrage.start();
    }
}, 2000);