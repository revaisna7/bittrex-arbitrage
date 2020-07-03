var Config = require('./Config.js');
var clear = require('clear');
var Balance = require('./Balance.js');
var Route = require('./Route.js');
var Trade = require('./Trade.js');
var Order = require('./Order.js');

module.exports = class View {

    static startTime = Date.now();
    static logInterval;
    static output;

    static init() {
        Config.triggers.push(function () {
            View.stop();
            View.start();
        });
        View.start();
    }

    static start() {
        View.logInterval = setInterval(View.update, Config.get('viewRefreshRate'));
    }

    static stop() {
        clearInterval(View.logInterval);
    }

    static clearConsole() {
        console.clear();
        clear();
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }

    static title() {
        var timeDiff = Date.now() - View.startTime;
        var hh = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hh * 1000 * 60 * 60;
        var mm = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= mm * 1000 * 60;
        var ss = Math.floor(timeDiff / 1000);
        hh = (hh < 10 ? '0' : '') + hh;
        mm = (mm < 10 ? '0' : '') + mm;
        ss = (ss < 10 ? '0' : '') + ss;

        return " [Bittrex Arbitrage] Time Running: " + hh + ":" + mm + ":" + ss + "\n\n";
    }

    static output = '';

    static generateOutput() {
        View.output = View.title()
                + Balance.consoleOutput()
                + Route.consoleOutput()
                + Trade.consoleOutput()
                + Order.consoleOutput();
    }

    static logOutput() {
        console.log(View.output);
        process.stdout.cursorTo(0);
    }

    static update() {
        View.generateOutput();
        View.clearConsole();
        View.logOutput();
    }

}