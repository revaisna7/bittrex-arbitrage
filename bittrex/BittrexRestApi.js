var CryptoJS = require("crypto-js");
var axios = require("axios");

module.exports = {

    account: async function(key, secret, subaccountid) {

        const method = 'GET'
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/account';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    accountVolume: async function(key, secret, subaccountid) {

        const method = 'GET'
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/account/volume';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;

    },

    addresses: async function(key, secret, subaccountid) {

        const method = 'GET'
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/addresses';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;

    },

    address: async function(key, secret, subaccountid, currency) {

        const method = 'GET'
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/addresses/' + currency;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;

    },

    newaddress: async function(key, secret, subaccountid, currency) {

        try {

            const method = 'POST'
            var apiSecret = secret;
            var apiKey = key;
            var timestamp = new Date().getTime();
            const subaccountId = subaccountid;

            let data = {
                "currencySymbol": currency
            }

            var contentHash = CryptoJS.SHA512(JSON.stringify(data)).toString(CryptoJS.enc.Hex);

            var uri = 'https://api.bittrex.com/v3/addresses';
            var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
            var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

            const headers = {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            }


            let response = await axios.post(uri, data, {
                headers: headers
            });


            return response.data;

        } catch (err) {
            console.log(err);
        }

    },

    balances: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/balances';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    balance: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/balances/' + currency;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    currencies: async function() {
        var uri = 'https://api.bittrex.com/v3/currencies';
        let response = await axios.get(uri);
        return response.data;
    },

    currency: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/currencies/' + currency;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    openDeposits: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/deposits/open';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    closedDeposits: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/deposits/closed';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },


    depositByTxId: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/deposits/ByTxId/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    depositId: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/deposits/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    markets: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    marketSummaries: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/summaries';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    marketTickers: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/tickers';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    marketBySymbol: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/' + currency;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    marketSymbolSummary: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/' + currency + '/summary';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    marketSymbolOrderbook: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/' + currency + '/orderbook';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri);



        return response.data;
    },

    marketSymbolTrades: async function(key, secret, subaccountid, currency) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/markets/' + currency + '/trades';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    closedOrder: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/orders/closed';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    openOrder: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/orders/open';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    orderId: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/orders/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });

        return response.data;
    },

    deleteOrder: async function(key, secret, subaccountid, id) {

        const method = 'DELETE';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/orders/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.delete(uri, {
            headers: headers
        });



        return response.data;
    },

    newOrder: async function(key, secret, subaccountid, marketSymbol, direction, type, timeInForce, quantity, ceiling, limit, clientOrderId, useAwards) {
        try {

            const method = 'POST';
            var apiSecret = secret;
            var apiKey = key;
            var timestamp = new Date().getTime();
            const subaccountId = '';

            let data;

            if (type === 'MARKET') {

                data = {
                    "marketSymbol": marketSymbol,
                    "direction": direction,
                    "type": type,
                    "timeInForce": timeInForce,
                    "quantity": quantity,
                }
            }

            if (type === 'LIMIT') {

                data = {
                    "marketSymbol": marketSymbol,
                    "direction": direction,
                    "type": type,
                    "timeInForce": timeInForce,
                    "quantity": quantity,
                    "limit": limit,
                }
            }

            if (type === 'CEILING_LIMIT' || type === 'CEILING_MARKET') {
                data = {
                    "marketSymbol": marketSymbol,
                    "direction": direction,
                    "type": type,
                    "timeInForce": timeInForce,
                    "limit": limit,
                    "ceiling": ceiling,
                }
            }


            var contentHash = CryptoJS.SHA512(JSON.stringify(data)).toString(CryptoJS.enc.Hex);

            var uri = 'https://api.bittrex.com/v3/orders';
            var preSign = [timestamp, uri, method, contentHash].join('');
            var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

            const headers = {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            }


            let response = await axios.post(uri, data, {
                headers: headers
            });



            return response.data;

        } catch (err) {
            console.log(err);
        }

    },

    subaccounts: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/subaccounts';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    sentTransfers: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/transfers/sent';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },


    receivedTransfers: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/transfers/received';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    transfersById: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/transfers/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    newTransfer: async function(key, secret, subaccountid, toSubaccountId, requestId, currencySymbol, amount, toMasterAccount) {

        try {

            const method = 'POST'
            var apiSecret = secret;
            var apiKey = key;
            var timestamp = new Date().getTime();
            const subaccountId = subaccountid;

            let data = {
                "toSubaccountId": toSubaccountId,
                "requestId": requestId,
                "currencySymbol": currencySymbol,
                "amount": amount,
                "toMasterAccount": toMasterAccount
            }

            var contentHash = CryptoJS.SHA512(JSON.stringify(data)).toString(CryptoJS.enc.Hex);

            var uri = 'https://api.bittrex.com/v3/transfers';
            var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
            var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

            const headers = {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            }


            let response = await axios.post(uri, data, {
                headers: headers
            });


            return response.data;

        } catch (err) {
            console.log(err);
        }

    },

    openWithdrawals: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/withdrawals/open';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    closedWithdrawals: async function(key, secret, subaccountid) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/withdrawals/closed';
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },


    withdrawalByTxId: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/withdrawals/ByTxId/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },


    withdrawalById: async function(key, secret, subaccountid, id) {

        const method = 'GET';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/withdrawals/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.get(uri, {
            headers: headers
        });



        return response.data;
    },

    deleteWithdrawals: async function(key, secret, subaccountid, id) {

        const method = 'DELETE';
        var apiSecret = secret;
        var apiKey = key;
        var timestamp = new Date().getTime();
        const subaccountId = subaccountid;

        var contentHash = CryptoJS.SHA512('').toString(CryptoJS.enc.Hex);

        var uri = 'https://api.bittrex.com/v3/withdrawals/' + id;
        var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
        var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
            'Api-Timestamp': timestamp,
            'Api-Content-Hash': contentHash,
            'Api-Signature': signature,
        }

        let response = await axios.delete(uri, {
            headers: headers
        });



        return response.data;
    },

    newWithdraw: async function(key, secret, subaccountid, currencySymbol, quantity, cryptoAddress, cryptoAddressTag) {

        try {

            const method = 'POST'
            var apiSecret = secret;
            var apiKey = key;
            var timestamp = new Date().getTime();
            const subaccountId = subaccountid;

            let data = {
                "currencySymbol": currencySymbol,
                "quantity": quantity,
                "cryptoAddress": cryptoAddress,
                "cryptoAddressTag": cryptoAddressTag
            }

            var contentHash = CryptoJS.SHA512(JSON.stringify(data)).toString(CryptoJS.enc.Hex);

            var uri = 'https://api.bittrex.com/v3/withdrawals';
            var preSign = [timestamp, uri, method, contentHash, subaccountId].join('');
            var signature = CryptoJS.HmacSHA512(preSign, apiSecret).toString(CryptoJS.enc.Hex);

            const headers = {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            }


            let response = await axios.post(uri, data, {
                headers: headers
            });


            return response.data;

        } catch (err) {
            console.log(err);
        }

    },

}