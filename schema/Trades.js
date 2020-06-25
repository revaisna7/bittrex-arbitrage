var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

module.exports = class Trades {

	static list = [];

	static push(trade) {
		Trades.list.push(trade);
	}

	static getCurrentTrades() {
		var trades = [];
		for(var i in trades) {
			var trade = trades[i];
			if(typeof trade === 'object') {
				if(trade.request && !trade.responeded) {
					trades.push(trade);
				}
			}
		}
		return trades;
	}

	static consoleOutput() {
		var output = "\n\n [Trades] (" + Trades.list.length + ")\n " + ["Market","Currency","Quantity","Rate","Request","Responded"].join("\t");
		for(var i in Trades.list) {
			output += "\n " + Trades.list[i].consoleOutput();
			if(i==9) { break };
		}
		return output;
	}
}