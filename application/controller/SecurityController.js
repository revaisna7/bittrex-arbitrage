var Controller = require('../../system/Controller.js');
var SocketServer = require('../../system/SocketServer.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var View = require('../../system/View.js');
var User = require('../model/User.js');
var Security = require('../model/Security.js');
var UserController = require('./UserController.js');

module.exports = class SecurityController extends Controller {

    static cookieName = Security.hash("" + (Math.random() * 1000000000));
    static cookieValue = Security.hash("" + (Math.random() * 1000000000));

    static passCookie(request, response) {
        response.cookie(SecurityController.cookieName, SecurityController.cookieValue, {maxAge: 900000, httpOnly: false});
    }

    static hasPassword() {
        return User.config('password') !== null;
    }

    static needsPassword(uriParts, request, response) {
        if (!SecurityController.hasPassword()) {
            console.log("No password set...");
            SecurityController.actionCreatePassword(uriParts, request, response);
            return true;
        }
        return false;
    }

    static hasApiSettings() {
        return Bittrex.config('apikey') !== null || Bittrex.config('apisecret') !== null;
    }

    static needsApiSettings(uriParts, request, response) {
        if (!SecurityController.hasApiSettings()) {
            console.log("No api settings set...");
            SecurityController.actionSetBittrexSettings(uriParts, request, response);
            return true;
        }
        return false;
    }

    static authenticate(uriParts, request, response) {
        if (request.cookies[SecurityController.cookieName] === SecurityController.cookieValue) {
            return true;
        }
        return false;
    }

    static actionSetBittrexSettings(uriParts, request, response) {
        if (Object.keys(request.body).length) {
            if (request.body.apikey && request.body.apisecret) {
                console.log("Request Update Set Bittrex Settings...");
                Bittrex.setConfig('apikey', request.body.apikey);
                Bittrex.setConfig('apisecret', request.body.apisecret);
                Bittrex.setConfig('subaccountid', request.body.subaccountid);
                Bittrex.commitConfig();
                setTimeout(() => {
                    SecurityController.actionReload(uriParts, request, response);
                }, 1000);
            } else {
                console.log("Request Create Error Set Bittrex Settings...");
                View.render('security/bittrex-settings', {error: !request.body.apikey || !request.body.apisecret}, response);
            }
        } else {
            console.log("Request Create Set Bittrex Settings...");
            View.render('security/bittrex-settings', {error: false}, response);
        }
    }

    static actionCreatePassword(uriParts, request, response) {
        if (Object.keys(request.body).length) {
            if (request.body.password && request.body.repeat_password && request.body.password === request.body.repeat_password) {
                console.log("Request Update Password...");
                Security.shake();
                setTimeout(() => {
                    User.setConfig('password', Security.hash(request.body.password));
                    User.commitConfig();
                    setTimeout(() => {
                        SecurityController.actionReload(uriParts, request, response);
                    }, 1000);
                }, 1000);
            } else {
                console.log("Request Create Error Password...");
                View.render('security/create-password', {error: !request.body.password || !request.body.repeat_password || request.body.password !== request.body.repeat_password}, response);
            }
        } else {
            console.log("Request Create Password...");
            View.render('security/create-password', {error: false}, response);
        }
    }

    static actionLogin(uriParts, request, response) {
        if (!SecurityController.needsPassword(uriParts, request, response)) {
            if (!SecurityController.needsApiSettings(uriParts, request, response)) {
                if (!SecurityController.authenticate(uriParts, request, response)) {
                    if (Object.keys(request.body).length && User.authenticate(request.body.password)) {
                        SecurityController.passCookie(request,response);
                        console.log('logged in...');
                        setTimeout(() => {
                            SecurityController.actionReload(uriParts, request, response);
                        }, 1000);
                    } else {
                        console.log("Request login...");
                        View.render('security/login', {error: request.body.password}, response);
                    }
                } else {
                    console.log("Request login...");
                    View.render('security/login', {error: false}, response);
                }
            }
        }
    }

};