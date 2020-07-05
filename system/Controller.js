var fs = require('fs');
var util = require('util');
var Configurable = require('./Configurable.js');

var existsSync = util.promisify(fs.existsSync);

module.exports = class Controller extends Configurable {

    static render(view, response, callback) {
        fs.readFile('./application/view/' + view, 'utf8', (error, data) => {
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

    static routeAction(request, response) {
        var uriParts = request.originalUrl.split('/');
        var controllerName;
        var actionName;
        var controllerPath;
        console.log(uriParts);
        if (uriParts[1]) {
            controllerName = (uriParts[1].charAt(0).toUpperCase()) + (uriParts[1].slice(1)) + 'Controller';
        } else {
            controllerName = Controller.getBase() + 'Controller';
        }
        if (uriParts[2]) {
            actionName = 'action' + (uriParts[2].charAt(0).toUpperCase()) + (uriParts[2].slice(1));
        } else {
            actionName = 'actionIndex';
        }
        var controllerPath = './application/controller/' + controllerName + '.js';

        console.log(controllerName, actionName, controllerPath);

        if (fs.existsSync(controllerPath)) {
            var controller = require('.' + controllerPath);
            if (controller && controller[actionName] && typeof controller[actionName] === 'function') {
                controller[actionName](uriParts, request, response);
                return true;
            }
        } else {
            return false;
        }
        console.log('File does not exist.');
        return false;
    }

    static getBase() {
        return Controller.config('base');
    }

    static routeSocket(socket, packet) {
        console.log("socket inbound");
        console.log(packet)
        var controllerName = (packet[0].charAt(0).toUpperCase()) + (packet[0].slice(1)) + 'Controller';
        var actionName = 'socket' + (packet[1].charAt(0).toUpperCase()) + (packet[1].slice(1));
        var controllerPath = './application/controller/' + controllerName + '.js';
        console.log(actionName, controllerPath);
         if (fs.existsSync(controllerPath)) {
            var controller = require('.' + controllerPath);
            if (controller && controller[actionName] && typeof controller[actionName] === 'function') {
                controller[actionName](socket, packet);
                return true;
            }
        } else {
            return false;
        }
        socket.emit('request not found.');
        return false;
    }
    
};