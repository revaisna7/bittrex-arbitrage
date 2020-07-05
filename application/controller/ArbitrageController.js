var Controller = require('../../system/Controller.js');

module.exports = class ArbitrageController extends Controller {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionIndex(uriParts, request, response) {
        response.send(await ArbitrageController.Arbitrage.Route.consoleOutput());
    }
    
    static async actionStart(uriParts, request, response) {
        await ArbitrageController.Arbitrage.start();
        response.send('started arbitrage');
    }
    
    static async socketIndex(socket, packet) {
        socket.emit('arbitrate', await ArbitrageController.Arbitrage.Route.consoleOutput())
        console.log('made it');
    }
    

};