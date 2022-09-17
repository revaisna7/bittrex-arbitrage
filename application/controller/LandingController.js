var SecurityController = require('./SecurityController.js');
var SocketServer = require('../../system/SocketServer.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var View = require('../../system/View.js');
var User = require('../model/User.js');

module.exports = class LandingController extends SecurityController {

    static actionInit(uriParts, request, response) {
        return LandingController.actionArbitrage(uriParts, request, response);
    }


    static actionSetTradeSettings(uriParts, request, response) {
        console.log("Request Set Trade Settings...");
    }

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

    static actionArbitrage(uriParts, request, response) {
        if (LandingController.authenticate(uriParts, request, response)) {
            setTimeout(() => {
                var ArbitrageController = require('../controller/ArbitrageController.js');
                ArbitrageController.Arbitrage.start();
            }, 1000);
            console.log("Request abritrage...");
            View.render('arbitrage/routes', {}, response);
        } else {
            LandingController.actionLogin(uriParts, request, response);
        }
    }


};