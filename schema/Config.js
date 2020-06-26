var fs = require('fs');

module.exports = class Config {
	
	static fileName = 'config.json';

	static values = {};
	static triggers = [];
	
	static init() {
		Config.getFile();
		Config.watchFile();
	}

	static get(property) {
		return Config.values[property];
	}

	static getFile() {
		Config.values = JSON.parse(fs.readFileSync(Config.fileName, 'utf8'));
		Config.triggerChanges();
	}

	static triggerChanges() {
		for(var i in Config.triggers) {
			Config.triggers[i]();
		}
	}

	static watchFile() {
		fs.watch(Config.fileName, function(event, filename) {
			if (filename && event ==='change') {
				setTimeout(function() { Config.getFile(); }, 1000);
			}
		});
	}

}