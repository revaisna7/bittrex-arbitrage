/*
 * Last tested 2020/09/24 on node v12.16.3.
 * 
 * Note: This file is intended solely for testing purposes and may only be used
 *   as an example to debug and compare with your code. The 3rd party libraries
 *   used in this example may not be suitable for your production use cases.
 *   You should always independently verify the security and suitability of any
 *   3rd party library used in your code.
 * 
 */
const signalR = require('signalr-client');
const zlib = require('zlib');
const crypto = require('crypto');
const uuid = require('uuid');

module.exports = class BittrexSocket {

    url = 'wss://socket-v3.bittrex.com/signalr';
    hub = ['c3'];

    apikey = '';
    apisecret = '';
    
    channels = [];
    static callback = () => {};

    static client;
    static instance;
    
    static resolveInvocationPromise = () => { };
    
    constructor(apikey, apisecret, channels, callback) {
        console.log('innit bittrex socket')
        this.apikey = apikey;
        this.apisecret = apisecret;
        this.channels = channels;
        BittrexSocket.callback = callback;
        BittrexSocket.instance = this;
        this.main();
    }
    
    async main() {
        BittrexSocket.client = await this.connect();
        if (this.apisecret) {
            await this.authenticate(BittrexSocket.client);
        } else {
            console.log('Authentication skipped because API key was not provided')
        }
        await this.subscribe(BittrexSocket.client);
    }

    async connect() {
        var _this = this;
        return new Promise((resolve) => {
            const client = new signalR.client(_this.url, _this.hub);
            client.serviceHandlers.messageReceived = this.messageReceived;
            client.serviceHandlers.connected = () => {
                console.log('Connected');
                return resolve(client)
            }
        });
    }

    async authenticate(client) {
        const timestamp = new Date().getTime()
        const randomContent = uuid.v4()
        const content = `${timestamp}${randomContent}`
        const signedContent = crypto.createHmac('sha512', this.apisecret).update(content).digest('hex').toUpperCase()

        const response = await this.invoke(client, 'authenticate',
                this.apikey,
                timestamp,
                randomContent,
                signedContent);

        if (response['Success']) {
            console.log('Authenticated');
        } else {
            console.log('Authentication failed: ' + response['ErrorCode']);
        }
    }

    async subscribe(client) {
        const channels = this.channels;
        const response = await this.invoke(client, 'subscribe', channels);

        for (var i = 0; i < channels.length; i++) {
            if (response[i]['Success']) {
                console.log('Subscription to "' + channels[i] + '" successful');
            } else {
                console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
            }
        }
    }

    async invoke(client, method, ...args) {
        var _this = this;
        return new Promise((resolve, reject) => {
            BittrexSocket.resolveInvocationPromise = resolve; // Promise will be resolved when response message received

            client.call(_this.hub[0], method, ...args)
                    .done(function (err) {
                        if (err) {
                            return reject(err);
                        }
                    });
        });
    }

    messageReceived(message) {
        const data = JSON.parse(message.utf8Data);
        if (data['R']) {
            BittrexSocket.resolveInvocationPromise(data.R);
        } else if (data['M']) {
            data.M.forEach(function (m) {
                if (m['A']) {
                    if (m.A[0]) {
                        const b64 = m.A[0];
                        const raw = new Buffer.from(b64, 'base64');

                        zlib.inflateRaw(raw, function (err, inflated) {
                            if (!err) {
                                const json = JSON.parse(inflated.toString('utf8'));
                                //console.log(m.M + ': ');
                                BittrexSocket.callback(json);
                            }
                        });
                    } else if (m.M == 'heartbeat') {
                        console.log('\u2661');
                    } else if (m.M == 'authenticationExpiring') {
                        console.log('Authentication expiring...');
                        _this.authenticate(client);
                    }
                }
            });
        }
    }
}