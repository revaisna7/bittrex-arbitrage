var Controller = require('../../system/Controller.js');
var SocketServer = require('../../system/SocketServer.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var View = require('../../system/View.js');
var User = require('../model/User.js');
var LandingController = require('./LandingController.js');

module.exports = class UserController extends Controller {

    static actionSetBittrexSettings(uriParts, request, response) {
        if (Object.keys(request.body).length) {
            if (request.body.apikey && request.body.apisecret) {
                console.log("Request Update Set Bittrex Settings...");
                Bittrex.updateConfig('apikey', request.body.apikey);
                Bittrex.updateConfig('apisecret', request.body.apisecret);
                Bittrex.updateConfig('subaccountid', request.body.subaccountid);
                setTimeout(function () {
                    LandingController.actionArbitrage(uriParts, request, response)
                }, 5000);
            } else {
                console.log("Request Create Error Set Bittrex Settings...");
                View.render('bittrex/settings', {error: !request.body.apikey || !request.body.apisecret}, response);
            }
        } else {
            console.log("Request Create Set Bittrex Settings...");
            View.render('bittrex/settings', {error: false}, response);
        }
    }


};