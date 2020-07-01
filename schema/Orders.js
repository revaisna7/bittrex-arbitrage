var Bittrex = require('../bittrex/Bittrex.js');
var Order = require('./Order.js');

module.exports = class Orders {

    static list = [];

    static ordersInterval;

    static getting = false;

    static async init() {
        await Orders.get();
        Orders.pulse();
    }

    static isGetting() {
        return Orders.getting;
    }

    static async get() {
        Orders.getting = true;
        let orders = await Bittrex.openOrder();
        Orders.update(orders);
        Orders.getting = false;
    }

    static pulse() {
        Orders.pulseStop();
        Orders.pulseStart();
    }

    static pulseStart() {
        Orders.ordersInterval = setInterval(Orders.get, 1000);
    }

    static pulseStop() {
        clearInterval(Orders.ordersInterval);
    }

    static update(orders) {
        Orders.list = [];
        for (var i in orders) {
            Orders.list.push(new Order(orders[i]));
        }
    }

    static consoleOutput() {
        var output = "\n\n [Orders]\n Market\t\tType\t\tQuantity\tRemaining\tTarget price\tCurrent price\tDifference\tFactor";
        for (var i in Orders.list) {
            output += Orders.list[i].consoleOutput();
        }
        return output;
    }

    static async cancelAll() {
        return await new Promise(async (resolve, reject) => {
            for (var i in Orders.list) {
                await Orders.list[i].cancel();
            }
            return resolve(true);
        });
    }

}