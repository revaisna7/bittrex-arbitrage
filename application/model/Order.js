var Model = require('../../system/Model.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var Currency = require('./Currency.js');
var Market = require('./Market.js');
var Util = require('../../system/Util.js');

module.exports = class Order extends Model {

    canceling = false;
    getting = false;
    marketSymbol = null;
    direction = null;
    type = null;
    quantity = null;
    timeInForce = null;
    fillQuantity = null;
    commission = null;
    proceeds = null;
    status = null;
    createdAt = null;
    updatedAt = null;

    static list = [];

    static ordersInterval;

    static getting = false;

    /**
     * 
     * @returns {undefined}
     */
    static async init() {
        await Order.get();
        Order.pulse();
    }

    /**
     * Whether the orders are current being requested
     * @returns {boolean}
     */
    static isGetting() {
        return Order.getting;
    }

    /**
     * Get orders
     * @returns {undefined}
     */
    static async get() {
        Order.getting = true;
        let orders = await Bittrex.openOrder();
        Order.update(orders);
        Order.getting = false;
    }

    /**
     * (Re)start order request interval
     * @returns {undefined}
     */
    static pulse() {
        Order.pulseStop();
        Order.pulseStart();
    }

    /**
     * Start order request interval
     * @returns {undefined}
     */
    static pulseStart() {
        Order.ordersInterval = setInterval(Order.get, 1000);
    }

    /**
     * Stop order request interval
     * @returns {undefined}
     */
    static pulseStop() {
        clearInterval(Order.ordersInterval);
    }

    /**
     * Update orders
     * @param {Object} orders Bittrex order response object
     * @returns {undefined}
     */
    static update(orders) {
        Order.list = [];
        for (var i in orders) {
            Order.list.push(new Order(orders[i]));
        }
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    static consoleOutput() {
        var output = "<h3>Order</h3><table><tr><th>Market</th><th>Type</th><th>Quantity</th><th>Remaining</th><th>Target price</th><th>Current price</th><th>Difference</th><th>Factor</th></tr>";
        for (var i in Order.list) {
            output += "<tr>" + Order.list[i].consoleOutput() + "</tr>";
        }
        return output + '</table>';
    }

    /**
     * Cancel all orders
     * @returns {Promise}
     */
    static async cancelAll() {
        return await new Promise(async (resolve, reject) => {
            for (var i in Order.list) {
                await Order.list[i].cancel();
            }
            return resolve(true);
        });
    }
    
    constructor(order) {
        super();
        Object.assign(this, order);
    }

    isAllowed() {
        return Config.get('currencies').indexOf(this.Currency) > -1;
    }

    isCanceling() {
        return this.canceling;
    }

    async get() {
        this.getting = true;
        Object.assign(this, Bittrex.orderId(this.id));
        this.getting = false;
    }

    getMarketSymbol() {
        return this.marketSymbol;
    }

    getType() {
        return this.type;
    }

    getQuantity() {
        return Number.parseFloat(this.quantity);
    }

    getLimit() {
        return Number.parseFloat(this.limit);
    }

    getFillQuantity() {
        return Number.parseFloat(this.fillQuantity);
    }

    getComission() {
        return Number.parseFloat(this.comission);
    }

    getProceeds() {
        return Number.parseFloat(this.proceeds);
    }

    getRemaining() {
        return this.getLimit() - this.getFillQuantity();
    }

    getMarket() {
        return Market.getBySymbol(this.marketSymbol);
    }

    getInputCurrency() {
        var currencySymbols = this.marketSymbol.split('-');
        return this.direction === 'BUY' ? Currency.getBySymbol(currencySymbols[1]) : Currency.getBySymbol(currencySymbols[0]);
    }

    getOutputCurrency() {
        var currencySymbols = this.marketSymbol.split('-');
        return this.direction === 'BUY' ? Currency.getBySymbol(currencySymbols[0]) : Currency.getBySymbol(currencySymbols[1]);
    }

    getCurrenctPrice() {
        return this.getMarket().getPrice(this.getOutputCurrency());
    }

    getPriceDifference() {
        return this.direction === 'SELL' ? this.getCurrenctPrice() - this.getLimit() : this.getLimit() - this.getCurrenctPrice();
    }
    
    getDifferenceFactor() {
        return this.getPriceDifference() / this.getCurrenctPrice() * 100;
    }

    async cancel() {
        this.canceling = true;
        await Bittrex.deleteOrder(this.id);
        this.canceling = false;
        this.get();
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<td>" + [
            this.getMarketSymbol(),
            this.getType(),
            Util.pad(this.getQuantity()),
            Util.pad(this.getRemaining()),
            Util.pad(this.getLimit()),
            Util.pad(this.getCurrenctPrice()),
            Util.addPlusOrSpace(this.getPriceDifference(), 8),
            Util.addPlusOrSpace(this.getDifferenceFactor()) + '%'
        ].join("</td><td>") + '</td>';
    }
}