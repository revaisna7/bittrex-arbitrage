var Controller = require('../../system/Controller.js');
var ArbitrageController = require('./ArbitrageController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');

module.exports = class LandingController extends Controller {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

};