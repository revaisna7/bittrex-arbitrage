var Controller = require('../../system/Controller.js');
var View = require('../../system/View.js');

module.exports = class LandingController extends Controller {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', response);
    }

};