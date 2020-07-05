var fs = require('fs');
var util = require('util');

const readFile = util.promisify(fs.readFile);
const readFileSync = util.promisify(fs.readFileSync);
const writeFile = util.promisify(fs.writeFile);


module.exports = class Configurable {

    static configFileName = './config/config.json';
    static configTiggers = [];
    static configuration = {};

    constructor() {
        Configurable.initConfig();
    }

    /**
     * Initialize a configurable
     * 
     * @param {string} [fileName]
     * @param {function} [callback]
     * @returns {undefined}
     */
    static async initConfig(fileName, callback) {
        fileName = fileName || Configurable.configFileName;
        await Configurable.getConfigFile(fileName, callback);
        Configurable.watchConfigFile();
    }
    
    /**
     * Initialize a configurable
     * 
     * @param {string} [fileName]
     * @param {function} [callback]
     * @returns {undefined}
     */
    static async initConfigCallback(callback) {
        var fileName = Configurable.configFileName;
        await Configurable.initConfig(fileName, callback);
    }
    
    static getConfig(property) {
        return Configurable.configuration[property] || null;
    }

    static async getConfigFile(fileName, callback) {
        fs.readFile(fileName, 'utf8', (error, data) => {
            if(data) {
                Configurable.configuration = JSON.parse(data);
                Configurable.triggerConfigChanges();
                if(callback) callback(data);
            }
            if(error) {
                console.log(error);
            }
        });
    }

    static triggerConfigChanges() {
        for (var i in Configurable.configTiggers) {
            Configurable.configTiggers[i]();
        }
    }

    static watchConfigFile() {
        fs.watch(Configurable.configFileName, (event, filename) => {
            if (filename && event === 'change') {
                setTimeout(() => {
                    Configurable.initConfig();
                }, 1000);
            }
        });
    }

    /**
     * Get config for class
     * 
     * @param {String} property Property name
     * @returns {Number|String|Array|Boolean|Object|Null}
     */
    config(property) {
        return Configurable.getConfig(this.constructor.toString())[property] || null;
    }
    
    /**
     * Get config for class
     * 
     * @param {String} property Property name
     * @returns {Number|String|Array|Boolean|Object|Null}
     */
    static config(property) {
        return Configurable.getConfig(this.name)[property] || null;
    }

};