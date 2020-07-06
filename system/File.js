var fs = require('fs');
var mime = require('mime');
var util = require('util');
var Configurable = require('./Configurable.js');

var existsSync = util.promisify(fs.existsSync);
var readFile = util.promisify(fs.readFile);

module.exports = class File extends Configurable {

    static async serve(request, response) {
        var filePath = File.getWebDirectory() + request.originalUrl;
        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
            console.log('serve file: ' + filePath);
            fs.readFile(filePath, (error, data) => {
                if (error) {
                    console.log(filePath, error);
                } else {
                    response.setHeader("Content-Type", mime.lookup(filePath));
                    response.writeHead(200);
                    response.end(data);
                }
            });
            return true;
        }
        console.log('file does not exist ' + filePath);
        return false;
    }

    static getWebDirectory() {
        return File.config('webDirectory');
    }
};