var fs = require('fs');
var Configurable = require('./Configurable.js');

module.exports = class Controller extends Configurable {

    static render(view, response, callback) {
        fs.readFile('./application/view/' + view, 'utf8', (error, data) => {
            if(data) {
                response.send(data);
            }
            if(error) {
                response.send(error);
            }
            if (callback)
                callback();
        });
    }

};