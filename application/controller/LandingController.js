var Controller = require('../../system/Controller.js');
var SocketServer = require('../../system/SocketServer.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var View = require('../../system/View.js');
var User = require('../model/User.js');

module.exports = class LandingController extends Controller {

    static cookieName = Math.random()*1000000000;

    static hasPassword() {
        return User.config('password') !== null;
    }

    static hasApiSettings() {
        return Bittrex.config('apikey') !== null || Bittrex.config('apisecret') !== null;
    }

    static needsPassword(uriParts, request, response) {
        if (!LandingController.hasPassword()) {
            console.log("No password set...");
            LandingController.actionCreatePassword(uriParts, request, response);
            return true;
        }
        return false;
    }

    static needsApiSettings(uriParts, request, response) {
        if (!LandingController.hasApiSettings()) {
            console.log("No api settings set...");
            LandingController.actionSetBittrexSettings(uriParts, request, response);
            return true;
        }
        return false;
    }

    static authenticate(uriParts, request, response) {
        if (request.cookies[LandingController.cookieName] === 'true') {
            console.log("Not logged in...");
            return true;
        }
        return false;
    }

    static actionInit(uriParts, request, response) {
        return LandingController.actionArbitrage(uriParts, request, response);
    }

    static actionCreatePassword(uriParts, request, response) {
        if (Object.keys(request.body).length) {
            if (request.body.password && request.body.repeat_password && request.body.password === request.body.repeat_password) {
                console.log("Request Update Password...");
                User.updateConfig('password', request.body.password);
                LandingController.actionArbitrage(uriParts, request, response);
            } else {
                console.log("Request Create Error Password...");
                View.render('user/createpassword', {error: !request.body.password || !request.body.repeat_password || request.body.password !== request.body.repeat_password}, response);
            }
        } else {
            console.log("Request Create Password...");
            View.render('user/createpassword', {error: false}, response);
        }
    }

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

    static actionSetTradeSettings(uriParts, request, response) {
        console.log("Request Set Trade Settings...");
    }

    static actionLogin(uriParts, request, response) {
        if (!LandingController.needsPassword(uriParts, request, response)) {
            if (!LandingController.needsApiSettings(uriParts, request, response)) {
                if (!LandingController.authenticate(uriParts, request, response)) {
                    if (Object.keys(request.body).length && User.authenticate(request.body.password)) {
                        response.cookie(LandingController.cookieName, true, {maxAge: 900000, httpOnly: false});
                        console.log('logged in...');
                        LandingController.actionReload(uriParts, request, response)
                    } else {
                        console.log("Request login...");
                        View.render('user/login', {error: request.body.password ? true : false}, response);
                    }
                } else {
                    console.log("Request login...");
                    View.render('user/login', {error: request.body.password ? true : false}, response);
                }
            }
        }
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

    static actionReload(uriParts, request, response) {
        View.render('landing/reload', {}, response);
    }

};