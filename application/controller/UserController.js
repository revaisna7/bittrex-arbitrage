var Controller = require('../../system/Controller.js');
var SocketServer = require('../../system/SocketServer.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var View = require('../../system/View.js');
var User = require('../model/User.js');
var LandingController = require('./LandingController.js');

module.exports = class UserController extends Controller {

    static cookieName = Math.random()*1000000000;

    static hasPassword() {
        return User.config('password') !== null;
    }
    static needsPassword(uriParts, request, response) {
        if (!SecurityController.hasPassword()) {
            console.log("No password set...");
            UserController.actionCreatePassword(uriParts, request, response);
            return true;
        }
        return false;
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


};