const Config = require('../model/Config.js');
Config.init('../Config.json');
var http = require('http');
var CryptoJS = require("crypto-js");
var Guid = require("guid");
var signalr = require("node-signalr");
var BitConverter = require("bit-converter");

class BittrexSocket {

    url = 'https://socket-v3.bittrex.com/signalr';
    hubs = ['c3'];
    client;
    apikey;
    apisecret;

    constructor() {
        this.apikey = Config.get('bittrexoptions').apikey;
        this.apisecret = Config.get('bittrexoptions').apisecret;
        var client = new signalr.client(this.url, this.hubs, 1, true);


        client.on('bound', this.bound);
        client.on('connectFailed', this.connectFailed);
        client.on('connected', this.connected);
        client.on('connectionLost', this.connectionLost);
        client.on('disconnected', this.disconnected);
        client.on('onerror', this.onerror);
        client.on('messageReceived', this.messageReceived);
        client.on('bindingError', this.bindingError);
        client.on('onUnauthorized', this.onUnauthorized);
        client.on('reconnected', this.reconnected);
        client.on('reconnecting', this.reconnecting);
        client.start();
        
        this.client = client;
    }

    async bound(message) {
        console.log('SignalR client bound.')
        console.log(message);
    }

    async connectFailed(message) {
        console.log('SignalR client connectFailed.')
        console.log(message);
    }

    async connected(connection) {
        console.log('SignalR client connected.')
        await this.authenticate();
//        this.subscribe(['orderbook', ['XRP-BTC']]);
//        this.client.on("c3", 'orderbook', (data) => {
//            console.log(data);
//            console.log(connection);
//        });
    }

    async connectionLost(message) {
        console.log('SignalR client connectionLost.')
        console.log(message);
    }

    async disconnected(message) {
        console.log('SignalR client disconnected.')
        console.log(message);
    }

    async onerror(message) {
        console.log('SignalR client onerror.')
        console.log(message);
    }

    async messageReceived(message) {
        console.log('SignalR client messageReceived.')
        console.log(message);
    }

    async bindingError(message) {
        console.log('SignalR client bindingError.')
        console.log(message);
    }

    async onUnauthorized(message) {
        console.log('SignalR client onUnauthorized.')
        console.log(message);
    }

    async reconnected(message) {
        console.log('SignalR client reconnected.')
        console.log(message);
    }

    async reconnecting(message) {
        console.log('SignalR client reconnecting.')
        console.log(message);
    }

    async authenticate() {

        console.log('Authenticate.')
        var timestamp = new Date().getTime();
        var randomContent = Guid.raw();
        var content = timestamp + '' + randomContent;
        var signedContent = this.createSignature(this.apikey, content);
        var result = this.client.invoke("c3", "Authenticate", this.apikey, timestamp, randomContent, signedContent);
        return result;
    }

    async subscribe(chanels, markets) {
        var result = this.client.invoke("c3", "Subscribe", chanels, markets);
        console.log(result);
        return result;
    }

    createSignature(content) {
        return CryptoJS.SHA512(this.apisecret + '' + content).toString(CryptoJS.enc.Hex);

    }

    setAuthExpiringHandler()
    {
        var _this = this;
        this.hub.on("authenticationExpiring", async () =>
        {
            await _this.authenticate();
        });
    }

    start() {
//        console.log('Start');
//        return this.client.start();
    }

}

var bittrexSocket = new BittrexSocket();
bittrexSocket.start();