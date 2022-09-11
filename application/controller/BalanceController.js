var Controller = require('../../system/Controller.js');

module.exports = class ArbitrageController extends Controller {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionIndex(uriParts, request, response) {
        response.send(await ArbitrageController.Arbitrage.consoleOutput());
    }
    

};