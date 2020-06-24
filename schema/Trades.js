var fs = require('fs'),
 	Config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
 	bittrex = require('node-bittrex-api');
bittrex.options(Config.bittrexoptions);

module.exports = class Trades {

	static list = [];

	static push(trade) {
		this.list.push(trades);
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
		return ["Market","Currency","Quantity","Rate","Request","Responded"].join("\t") + "\n" 
			 + Trades.list.join("\n");
	}
}