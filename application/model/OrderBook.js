var Model = require('../../system/Model.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');

module.exports = class OrderBook extends Model  {

    market = null;
    ask = [];
    bid = [];
    getting = false;
    interval = null;
    socket = null;
    static nextIndex = 0;
    static list = [];
    
    /**
     * 
     * @param {Market} market
     * @returns {OrderBook}
     */
    constructor(market) {
        super();
        this.market = market;
        OrderBook.list.push(this);
        return this;
    }

    static async init() {
        console.log('Inititialize OrderBook...');
        for(var i in OrderBook.list) {
            await OrderBook.list[i].get();
//            OrderBook.list[i].pulse();
        }
        OrderBook.interval = setInterval(OrderBook.updateNext, OrderBook.config('updateInterval'));
    }
    
    static updateNext() {
        var list = OrderBook.getUsed();
        if(OrderBook.nextIndex >= list.length) {
            OrderBook.nextIndex = 0;
        }
        list[OrderBook.nextIndex].get();
        OrderBook.nextIndex++;
        
    }
    
    static getUsed() {
        var orderBooks = [];
        for(var i in OrderBook.list) {
            if(OrderBook.list[i].market.canTrade()) {
                orderBooks.push(OrderBook.list[i]);
            }
        }
        return orderBooks;
    }

    async get() {
        if (this.market.canTrade()) {
            this.getting = true;
            var orderBook = await Bittrex.marketSymbolOrderbook(this.market.symbol);
            this.ask = orderBook.ask;
            this.bid = orderBook.bid;
            this.triggerRoutes();
        }
    }

    Ask() {
        this.ask.sort(this.sortDown);
        return this.ask.length > 0 ? this.ask[0].rate : 0;
    }
    
    addAsk(order) {
        this.ask.push(order);
    }

    getAsk(rate) {
        for (var i in this.ask) {
            if (this.ask[i].rate === rate) {
                return this.ask[i];
            }
        }
    }

    Asks(rate) {
        var quantity = 0;
        for (var i in this.ask) {
            if (this.ask[i].rate <= rate) {
                quantity += this.ask[i].quantity;
            }
        }
        return quantity;
    }

    removeAsk(order) {
        const index = this.ask.indexOf(order);
        if (index > -1) {
            this.ask.splice(index, 1);
        }
    }

    Bid() {
        this.bid.sort(this.sortUp);
        return this.bid.length > 0 ? this.bid[0].rate : 0;
    }

    addBid(order) {
        this.bid.push(order);
    }

    getBid(rate) {
        for (var i in this.bid) {
            if (this.bid[i].rate === rate) {
                return this.bid[i];
            }
        }
    }

    Bids(rate) {
        var quantity = 0;
        for (var i in this.bid) {
            if (this.bid[i].rate >= rate) {
                quantity += this.bid[i].quantity;
            }
        }
        return quantity;
    }

    removeBid(order) {
        const index = this.bid.indexOf(order);
        if (index > -1) {
            this.bid.splice(index, 1);
        }
    }

    updateExchangeState(data) {
        for (var i in data.Buys) {
            var bid = this.getBid(data.Buys[i].rate);
            switch (data.Buys[i].Type) {
                case 0:
                    if (bid) {
                        bid = {quantity: data.Buys[i].Quantity, rate: data.Buys[i].Rate};
                    } else {
                        this.addBid({quantity: data.Buys[i].Quantity, rate: data.Buys[i].Rate});
                    }
                    break;
                case 2 :
                    if (bid) {
                        bid.quantity = data.Buys[i].Quantity;
                    } else {
                        this.addBid({quantity: data.Buys[i].Quantity, rate: data.Buys[i].Rate});
                    }
                    break;
                case 1 :
                    if (bid) {
                        this.removeBid(bid);
                    }
                    break;
            }
        }

        for (var i in data.Sells) {
            var ask = this.getAsk(data.Sells[i].rate);
            switch (data.Sells[i].Type) {
                case 0 :
                    if (ask) {
                        ask = {quantity: data.Sells[i].Quantity, rate: data.Sells[i].Rate};
                    } else {
                        this.addAsk({quantity: data.Sells[i].Quantity, rate: data.Sells[i].Rate});
                    }
                    break;
                case 2 :
                    if (ask) {
                        ask.quantity = data.Sells[i].Quantity;
                    } else {
                        this.addAsk(data.Sells[i]);
                    }
                    break;
                case 1 :
                    if (ask) {
                        this.removeAsk(ask);
                    }
                    break;
            }
        }
    }

    sortUp(a, b) {
        return a.rate > b.rate ? -1 : a.rate < b.rate ? 1 : 0;
    }

    sortDown(a, b) {
        return a.rate < b.rate ? -1 : a.rate > b.rate ? 1 : 0;
    }

    pulse() {
        this.pulseStop();
        this.pulseStart();
    }

    pulseStart() {
        var _this = this;
//        this.interval = setInterval(() => { _this.get(); }, OrderBook.config('updateInterval'));
    }

    pulseStop() {
        clearInterval(this.interval);
    }

    /**
     * @todo fix this for API v3, broken because market symbols are different in v1.1
     */
    subscribeSocket() {
        var _this = this;
        console.log(this.market.symbol);
        this.socket = Bittrex.subscribeOrderBook([this.market.symbol], (data) => {
            console.log(data);
            if (data.M === 'updateExchangeState') {
                data.A.forEach(function(data_for) {
                    _this.updateExchangeState(data_for);
                });
            }
        });
    }

    triggerRoutes() {
        this.market.triggerRoutes();
    }

};