console.log("Inititializing config");
var Configurable = require('./system/Configurable.js');
Configurable.initConfig()


setTimeout(() => {
    // init web server
    var WebServer = require('./system/WebServer.js');
    var SocketServer = require('./system/SocketServer.js');

    console.log("Initializing webserver");
    WebServer.init();

    console.log("Initializing socketserver");
    SocketServer.init();
}, 2000);