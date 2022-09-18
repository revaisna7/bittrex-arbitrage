var SecurityController = require('./SecurityController.js');
var ArbitrageController = require('./ArbitrageController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');
var Route = require('../model/Route.js');
var Delta = require('../model/Delta.js');

module.exports = class ConfigController extends SecurityController {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

    static actionConfig(uriParts, request, response) {
        if (ConfigController.authenticate(uriParts, request, response)) {
            console.log(request.body.trade);
            if (request.body.trade !== undefined) {
                Route.setConfig('trade', Array.isArray(request.body.trade) ? true : false);
            }
            if (request.body.minInputBtc) {
                Route.setConfig('minInputBtc', request.body.minInputBtc);
            }
            if (request.body.minProfitFactor) {
                Route.setConfig('minProfitFactor', request.body.minProfitFactor);
            }
            if (request.body.profitAllThree !== undefined) {
                Route.setConfig('profitAllThree', Array.isArray(request.body.profitAllThree) ? true : false);
            }
            if (request.body.nextTradeTimeout) {
                Route.setConfig('nextTradeTimeout', request.body.nextTradeTimeout);
            }
            if (request.body.mode) {
                Delta.setConfig('mode', request.body.mode);
            }
            if (request.body.fix) {
                Delta.setConfig('fix', request.body.fix);
            }
            Route.commitConfig();
            Delta.commitConfig();
            console.log('Update config...');
            setTimeout(function(){ 
                View.render('config/config', {route: Route, delta: Delta}, response);
            }, 2000);
        } else {
            ConfigController.reload(uriParts, request, response);
        }
    }

};