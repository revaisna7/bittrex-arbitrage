var express = require('express');
var Configurable = require('./Configurable.js');
var fs = require('fs');

module.exports = class WebServer extends Configurable {

    static server;

    static getFileDirectory() {
        return WebServer.config('fileDirectory');
    }

    static getPort() {
        return WebServer.config('port');
    }

    static getBaseContollerName() {
        return WebServer.config('baseController');
    }

    static getHost() {
        return WebServer.config('host');
    }

    static getProtocol() {
        return WebServer.config('protocol');
    }

    static init() {
        this.initConfigCallback(WebServer.start);
    }

    static start() {
        WebServer.server = express();
        WebServer.listen();
        WebServer.route();
    }

    static route() {
        WebServer.server.use(WebServer.routeController);
    }

    static routeController(request, response) {
        var uriParts = request.originalUrl.split('/');
        var controllerName = uriParts[1].charAt(0).toUpperCase() + uriParts[1].slice(1) + 'Controller' || WebServer.getBaseContollerName();
        var actionName = 'action' + uriParts[2].charAt(0).toUpperCase() + uriParts[1].slice(2) || 'index';
        var controllerPath = './application/controller/' + controllerName + '.js';
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
            response.send('404. You have found the nonexistent page. This page exists but yet it does not. Good luck finding it.');
        }
    }

    static listen() {
        WebServer.server.listen(WebServer.getPort(), WebServer.onListen);
    }

    static onListen() {
        console.log('Web server avaialbe to serve through port: ' + WebServer.getPort());
    }
};