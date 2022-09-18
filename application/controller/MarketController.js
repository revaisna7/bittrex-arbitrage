var SecurityController = require('./SecurityController.js');
var ArbitrageController = require('./ArbitrageController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');
var Market = require('../model/Market.js');

module.exports = class MarketController extends SecurityController {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

    static actionConfig(uriParts, request, response) {
        if (MarketController.authenticate(uriParts, request, response)) {
            if (request.body['symbol[]'] !== undefined) {
                console.log('Update disabled markets...')
                Market.setConfig('restrict', request.body['symbol[]']);
                Market.commitConfig();
                ArbitrageController.Arbitrage.Route.init();
                setTimeout(() => {
                    View.render('market/config', {markets: Market.list}, response);
                }, 1000);
            } else {
                View.render('market/config', {markets: Market.list}, response);
            }
        } else {
            MarketController.reload(uriParts, request, response);
        }
    }

};