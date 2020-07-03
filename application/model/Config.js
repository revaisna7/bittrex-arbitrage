var fs = require('fs');

module.exports = class Config {

    static fileName = 'config.json';

    static values = {};
    static triggers = [];

    /**
     * 
     * @returns {undefined}
     */
    static init(fileName) {
        Config.fileName = fileName || Config.fileName;
        Config.getFile();
        Config.watchFile();
    }

    static get(property) {
        return Config.values[property] || null;
    }

    static getFile() {
        Config.values = JSON.parse(fs.readFileSync(Config.fileName, 'utf8'));
        Config.triggerChanges();
    }

    static triggerChanges() {
        for (var i in Config.triggers) {
            Config.triggers[i]();
        }
    }

    static watchFile() {
        fs.watch(Config.fileName, (event, filename) => {
            if (filename && event === 'change') {
                setTimeout(() => {
                    Config.init();
                }, 1000);
            }
        });
    }

}