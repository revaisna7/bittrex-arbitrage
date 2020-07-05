var io = require('socket.io');
var Configurable = require('./Configurable.js');
var WebServer = require('./WebServer.js');
var Controller = require('./Controller.js');
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
        SocketServer.server.listen(SocketServer.getPort());
        SocketServer.server.on('connection', SocketServer.route);
        console.log('Socket server avaialbe to serve through port: ' + SocketServer.getPort());
    }

    static listen() {
    }
    
    static route() {
    }

    static onConnection() {
        
    }

    static route(socket) {
        var _socket = socket;
        socket.use((packet) => {
            Controller.routeSocket(_socket,packet);
        });
    }


    static onListen() {
    }
};