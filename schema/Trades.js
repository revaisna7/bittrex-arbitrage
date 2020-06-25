
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
		var output = "\n\n [Trades] (" + Trades.list.length + ")\n " + ["Market","Currency","Quantity","Rate","Request","Responded"].join("\t\t");
		for(var i = Trades.list.length-1; i > 0; i--) {
			output += "\n " + Trades.list[i].consoleOutput();
			if(Trades.list.length-i==6) { break };
		}
		return output;
	}
}