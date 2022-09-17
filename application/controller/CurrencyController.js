var SecurityController = require('./SecurityController.js');
var ArbitrageController = require('./ArbitrageController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');
var Currency = require('../model/Currency.js');

module.exports = class CurrencyController extends SecurityController {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

    static actionConfig(uriParts, request, response) {
        if (CurrencyController.authenticate(uriParts, request, response)) {
            var allCurrencies = Currency.list;
            if (request.body['symbol[]'] !== undefined) {
                console.log('Update allowed currencies...')
                Currency.setConfig('allow', request.body['symbol[]']);
                Currency.commitConfig();
                ArbitrageController.Arbitrage.Route.init();
                setTimeout(() => {
                    View.render('currency/config', {allCurrencies: allCurrencies}, response);
                }, 1000);
            } else {
                View.render('currency/config', {allCurrencies: allCurrencies}, response);
            }
        } else {
            CurrencyController.reload(uriParts, request, response);
        }
    }

};