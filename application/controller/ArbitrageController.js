var SecurityController = require('./SecurityController.js');
var View = require('../../system/View.js');

module.exports = class ArbitrageController extends SecurityController {

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
        response.redirect('/');
    }
    static async actionTradeToBtc(uriParts, request, response) {
        await ArbitrageController.BookBalancer.closeOrders();
        await ArbitrageController.BookBalancer.tradeToBtc();
    }

    static async socketIndex(socket, packet) {
        var _socket = socket;
        setInterval(() => {
            _socket.emit('arbitrage', JSON.stringify({
                'routes' : ArbitrageController.Arbitrage.Route.consoleOutput(),
                'balances' : ArbitrageController.Arbitrage.Balance.consoleOutput(),
                'trades' : ArbitrageController.Arbitrage.Trade.consoleOutput(),
                'orders' : ArbitrageController.Arbitrage.Order.consoleOutput(),
            }));
        }, ArbitrageController.config('socketInterval'));
    }

    static actionArbitrage(uriParts, request, response) {
        if (ArbitrageController.authenticate(uriParts, request, response)) {
            setTimeout(() => {
                ArbitrageController.Arbitrage.start();
            }, 1000);
            console.log("Request abritrage...");
            View.render('arbitrage/routes', {}, response);
        } else {
            ArbitrageController.actionLogin(uriParts, request, response);
        }
    }

};