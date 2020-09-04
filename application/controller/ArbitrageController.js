var Controller = require('../../system/Controller.js');

module.exports = class ArbitrageController extends Controller {

    static Arbitrage = require('../model/Arbitrage.js');
    static BookBalancer = require('../model/BookBalancer.js');

    static async actionIndex(uriParts, request, response) {
        response.send(await ArbitrageController.Arbitrage.consoleOutput());
    }
    

    static async actionCancelAll(uriParts, request, response) {
        await ArbitrageController.Order.cancelAll();
        
    }
    
    static async actionRebalance(uriParts, request, response) {
        await ArbitrageController.BookBalancer.rebalance();
    }
    static async actionTradeToBtc(uriParts, request, response) {
        await ArbitrageController.BookBalancer.tradeToBtc();
    }
    
    static async socketIndex(socket, packet) {
        var _socket = socket;
        setInterval((socket) => { _socket.emit('arbitrage', ArbitrageController.Arbitrage.consoleOutput()); } , ArbitrageController.config('socketInterval'));
    }
    

};