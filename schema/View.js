var Config = require('./Config.js');
var clear = require('clear');
var Balances = require('./Balances.js');
var Routes = require('./Routes.js');
var Trades = require('./Trades.js');
var Orders = require('./Orders.js');

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
                + Balances.consoleOutput()
                + Routes.consoleOutput()
                + Trades.consoleOutput()
                + Orders.consoleOutput();
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