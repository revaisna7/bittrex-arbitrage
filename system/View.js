var fs = require('fs');
var util = require('util');
var ejs = require('ejs');
var Configurable = require('./Configurable.js');

var existsSync = util.promisify(fs.existsSync);

module.exports = class View extends Configurable {

    static render(view, response, callback) {
        ejs.renderFile('./application/view/' + view + '.ejs.html', 'utf8', (error, data) => {
            if (data) {
                response.send(data);
            }
            if (error) {
                response.send(error);
            }
            if (callback)
                callback();
        });
    }
    
};