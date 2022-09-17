var fs = require('fs');
var util = require('util');

const readFile = util.promisify(fs.readFile);
const readFileSync = util.promisify(fs.readFileSync);
const writeFile = util.promisify(fs.writeFile);


module.exports = class Configurable {

    static initialized = false;
    static templateFileName = './config/config.default.json';
    static configFileName = './config/config.json';
    static configTiggers = [];
    static configuration = {};

    constructor() {
        if (Configurable.initialized === false) {
            Configurable.initConfig();
        }
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
        callback = callback || ((e) => { if (e) {  } });
        try {
            await Configurable.getConfigFile(fileName, callback);
            if (Configurable.initialized === false) {
                Configurable.watchConfigFile();
            }
            Configurable.initialized = true;
        } catch(e) {
            try {
                await Configurable.createConfig(() => {
                    setTimeout(() => {
                        Configurable.initConfig(fileName, callback);
                    }, 1000);
                });
            } catch(e) {
                throw e;
            }
        }
    }

    static async createConfig(callback) {
        console.log('Creating config file...');
        fs.copyFile(Configurable.templateFileName, Configurable.configFileName, (err) => {
          if (err) throw err;
        });
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
        fileName = fileName || Configurable.configFileName;
        fs.readFile(fileName, 'utf8', (error, data) => {
            if (data) {
                Configurable.configuration = JSON.parse(data);
                Configurable.triggerConfigChanges();
                if (callback)
                    callback(data);
            }
            if (error) {
                //console.log(error);
            }
        });
    }
    
    static async setConfigFile(fileName, callback) {
        fileName = fileName || Configurable.configFileName;
        fs.writeFile(fileName, JSON.stringify(Configurable.configuration), 'utf8', (error, data) => {
            if (data) {
                if (callback)
                    callback(data);
            }
            if (error) {
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
                }, 10000);
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
    
    /**
     * Set a config property
     * 
     * @param {string} property
     * @param {Number|String|Array|Boolean|Object|Null} value
     * @param {function} callback
     * @returns {undefined}
     */
     setConfig(property, value) {
        Configurable.configuration[this.name][property] = value;
    }
    
        /**
     * Get config for class
     * 
     * @param {String} property Property name
     * @returns {Number|String|Array|Boolean|Object|Null}
     */
    static commitConfig(callback) {
        return Configurable.commitConfig(callback);
    }
    
    /**
     * Set a config property
     * 
     * @param {string} property
     * @param {Number|String|Array|Boolean|Object|Null} value
     * @param {function} callback
     * @returns {undefined}
     */
    static setConfig(property, value) {
        Configurable.configuration[this.name][property] = value;
    }
    
    /**
     * Update config file to current configuration
     * 
     * @param {function} callback
     * @returns {undefined}
     */
    static commitConfig(callback) {
        this.setConfigFile(Configurable.configFileName, callback);
    }

};