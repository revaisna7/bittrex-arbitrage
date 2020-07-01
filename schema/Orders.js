var Bittrex = require('../bittrex/Bittrex.js');
var Order = require('./Order.js');

module.exports = class Orders {

    static list = [];

    static ordersInterval;

    static getting = false;

    /**
     * 
     * @returns {undefined}
     */
    static async init() {
        await Orders.get();
        Orders.pulse();
    }

    /**
     * Whether the orders are current being requested
     * @returns {boolean}
     */
    static isGetting() {
        return Orders.getting;
    }

    /**
     * Get orders
     * @returns {undefined}
     */
    static async get() {
        Orders.getting = true;
        let orders = await Bittrex.openOrder();
        Orders.update(orders);
        Orders.getting = false;
    }

    /**
     * (Re)start order request interval
     * @returns {undefined}
     */
    static pulse() {
        Orders.pulseStop();
        Orders.pulseStart();
    }

    /**
     * Start order request interval
     * @returns {undefined}
     */
    static pulseStart() {
        Orders.ordersInterval = setInterval(Orders.get, 1000);
    }

    /**
     * Stop order request interval
     * @returns {undefined}
     */
    static pulseStop() {
        clearInterval(Orders.ordersInterval);
    }

    /**
     * Update orders
     * @param {Object} orders Bittrex order response object
     * @returns {undefined}
     */
    static update(orders) {
        Orders.list = [];
        for (var i in orders) {
            Orders.list.push(new Order(orders[i]));
        }
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    static consoleOutput() {
        var output = "\n\n [Orders]\n Market\t\tType\t\tQuantity\tRemaining\tTarget price\tCurrent price\tDifference\tFactor";
        for (var i in Orders.list) {
            output += Orders.list[i].consoleOutput();
        }
        return output;
    }

    /**
     * Cancel all orders
     * @returns {Promise}
     */
    static async cancelAll() {
        return await new Promise(async (resolve, reject) => {
            for (var i in Orders.list) {
                await Orders.list[i].cancel();
            }
            return resolve(true);
        });
    }

}