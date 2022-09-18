var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Configurable = require('./Configurable.js');
var File = require('./File.js');
var Controller = require('./Controller.js');

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
        WebServer.server.use(bodyParser.urlencoded({extended: false}));
        WebServer.server.use(bodyParser.json());
        WebServer.server.use(cookieParser());
        WebServer.listen();
        WebServer.server.use(WebServer.route);
    }

    static route(request, response) {
        if (!Controller.routeAction(request, response)) {
            if (!File.serve(request, response)) {
                response.end('404. You have found the nonexistent page. This page exists but yet it does not. Good luck finding it.');
            }
        }
    }

    static listen() {
        WebServer.server.listen(WebServer.getPort(), WebServer.onListen);
    }

    static onListen() {
        console.log('Web server available to serve through port: ' + WebServer.getPort());
    }
};