var fs = require('fs');

module.exports = class Util {
    
    static spin = 0;
    
    static spinner() {
        return '';
    }
    
    
    static addPlusOrSpace(number, decimals) {
        var decimals = decimals || 3;
        var number = Number.parseFloat(number);
        var str = '';
        if (number === 0) {
            str += '0';
        }
        if (number < 0) {
            str += '<span class="loss">';
            str += '-';
        }
        if (number > 0) {
            str += '<span class="profit">';
            str += '+';
        }
        if (number < 10 && number > -10) {
            str += '0';
        }
        return str + number.toFixed(decimals).replace('-', '') + "</span>";
    }

    static pad(number, decimals) {
        var number = Number.parseFloat(number);
        var decimals = decimals || 8;
        var str = '';
        if (number < 10 && number > -10) {
            str += ' ';
        }
        if (number < 100 && number > -100) {
            str += ' ';
        }
        if (number < 1000 && number > -1000) {
            str += ' ';
        }
        return str + number.toFixed(decimals);
    }

    static when(wait, then, timer) {
        var timer = timer || 1;
        var interval = setInterval(function () {
            if (!wait()) {
                clearInterval(interval);
                if (Array.isArray(then) && then.length > 0) {
                    return Util.when(then.shift(), then, timer);
                }
                return then();
            }
        }, timer);
    }

    static createLogDirectory() {
        var dir = './tmp';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    static logError(data) {
        Util.log("\n\n " + (new Date().toLocaleString()) + "\n" + JSON.stringify(data, null, 2), 'error');
    }

    static logFile(fileName, data) {
        fs.appendFile(fileName, data, function (err) {
            if (err)
                throw err;
        });
    }

    static log(data, type) {
        if (!fs.existsSync('log')) {
            fs.mkdirSync('log');
        }
        if (!fs.existsSync('log/' + type)) {
            fs.mkdirSync('log/' + type);
        }
        var fileName = 'log/' + type + '/' + Util.getFormattedTime() + '.log';
        fs.open(fileName, 'r', function (err, fd) {
            if (err) {
                fs.writeFile(fileName, data, function (err) {
                    if (err)
                        throw err;
                });
            } else {
                fs.appendFile(fileName, data, function (err) {
                    if (err)
                        throw err;
                });
            }
        });

    }

    static getFormattedTime() {
        var today = new Date();
        var y = today.getFullYear();
        var m = today.getMonth() + 1;
        var d = today.getDate();
        var h = today.getHours();
        var i = today.getMinutes();
        var s = today.getSeconds();
        var dd = (d < 10 ? '0' : '') + d;
        var mm = (m < 10 ? '0' : '') + m;
        var hh = (h < 10 ? '0' : '') + h;
        var ii = (i < 10 ? '0' : '') + i;
        var ss = (s < 10 ? '0' : '') + s;
        return y + "-" + mm + "-" + dd + "_" + hh + "_" + ii + "_" + ss;
    }
}