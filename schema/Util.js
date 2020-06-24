module.exports = class Util {
	static addPlusOrSpace(number, decimals) {
		var decimals = decimals || 3;
		var number = Number.parseFloat(number);
		var str = '';
		if (number === 0) {
			str += ' ';
		}
		if (number < 0) {
			str += "\x1b[31m";
			str += '-';
		}
		if (number > 0) {
			str += "\x1b[32m";
			str += '+';
		}
		if (number < 10 && number > -10) {
			str += '0';
		}
		return str + number.toFixed(decimals).replace('-', '') + "\x1b[0m";
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

	static doThen(conditional,then,timer) {
		var timer = timer || 1;
		var interval = setInterval(function(){
			if(conditional()) {
				clearInterval(interval);
				then();
			}
		}, timer);
	}

	static logError(data) {
		Util.logFile('errorlog', "\n\n " + (new Date().toLocaleString()));
		this.logFile('errorlog', JSON.stringify(this.request, null, 2));
	}

	static logFile(fileName, data) {
		fs.appendFile(fileName, data, function(err) {  if (err) throw err; });
	}
}