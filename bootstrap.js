// init models
var Config = require('./system/WebServer.js');

// init web server
var WebServer = require('./system/WebServer.js');
var SocketServer = require('./system/SocketServer.js');
WebServer.init();
SocketServer.init();
setTimeout(() => {
var ArbitrageController = require('./application/controller/ArbitrageController.js');
ArbitrageController.Arbitrage.start();
}, 1000);

// init socket server