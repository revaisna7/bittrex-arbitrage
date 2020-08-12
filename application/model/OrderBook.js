var Model = require('../../system/Model.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');

module.exports = class OrderBook extends Model  {

    market = null;
    ask = 0;
    bid = 0;
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
            var ticker = await Bittrex.marketSymbolTicker(this.market.symbol);
            this.ask = ticker.askRate;
            this.bid = ticker.bidRate;
            this.last = ticker.lastTradeRate;
            this.triggerRoutes();
        }
    }

    Ask() {
        return Number(this.ask);
    }
    
    Bid() {
        return Number(this.bid);
    }
    
    Last() {
        return Number(this.last);
    }

    pulse() {
        this.pulseStop();
        this.pulseStart();
    }

    pulseStart() {
        var _this = this;
        this.interval = setInterval(() => { _this.get(); }, OrderBook.config('updateInterval'));
    }

    pulseStop() {
        clearInterval(this.interval);
    }

    triggerRoutes() {
        this.market.triggerRoutes();
    }

};