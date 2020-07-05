var Controller = require('../../system/Controller.js');

module.exports = class LandingController extends Controller {

    static actionIndex(uriParts, request, response) {
        this.render('template/base.html', response);
    }

};