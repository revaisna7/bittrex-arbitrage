var Controller = require('../../system/Controller.js');

module.exports = class ArbitrageController extends Controller {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionIndex(uriParts, request, response) {
        response.send(await ArbitrageController.Arbitrage.Route.consoleOutput());
    }
    
    static async actionStart(uriParts, request, response) {
        await ArbitrageController.Arbitrage.start();
        response.redirect('/');
        
    }
    
    static async socketIndex(socket, packet) {
        var _socket = socket;
        setInterval((socket) => { _socket.emit('arbitrage', ArbitrageController.Arbitrage.Route.consoleOutput()); } ,500);
        console.log('made it');
    }
    

};