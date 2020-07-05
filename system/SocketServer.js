var io = require('socket.io');
var Configurable = require('./Configurable.js');
var WebServer = require('./WebServer.js');
var fs = require('fs');

module.exports = class SocketServer extends Configurable {

    static server;
    static socket;

    static getPort() {
        return SocketServer.config('port');
    }

    static getBaseContollerName() {
        return SocketServer.config('baseController');
    }

    static getHost() {
        return SocketServer.config('host');
    }

    static getProtocol() {
        return SocketServer.config('protocol');
    }

    static init() {
        this.initConfigCallback(SocketServer.start);
    }

    static start() {
        SocketServer.server = io();
        SocketServer.listen(SocketServer.getPort());
        SocketServer.route();
    }

    static listen() {
        SocketServer.server.listen(SocketServer.getPort());
        console.log('Socket server avaialbe to serve through port: ' + SocketServer.getPort());
    }
    
    static route() {
        SocketServer.server.use(SocketServer.routeController);
    }

    static onConnection() {
        
    }

    static routeController(socket) {
        console.log(socket);
        var uriParts = request.originalUrl.split('/');
        var controllerName = uriParts[1].charAt(0).toUpperCase() + uriParts[1].slice(1) || WebServer.getBaseContollerName();
        var actionName = uriParts[2] || 'index';
        var controllerPath = './application/controller/' + controllerName + 'Controller.js';
        var filePath = WebServer.getFileDirectory() + request.originalUrl;
        if (fs.existsSync(controllerPath)) {
            try {
                console.log(controllerName, actionName);
                var controller = require('.' + controllerPath);
                if (controller && controller[actionName] && typeof controller[actionName] === 'function') {
                    controller[actionName](uriParts, request, response);
                }
            } catch (e) {
                response.send(e);
                console.log(e);
            }
        } else if (fs.existsSync(filePath)) {
            console.log('serve file: ' + filePath);
            fs.readFile(filePath, (error, data) => {
                if (data) {
                    response.send(data);
                }
                if (error) {
                    console.log(filePath, error);
                }
            });
        } else {
            response.send('404, this page exists but yet it does not, good luck finding it.');
        }
    }


    static onListen() {
    }
};