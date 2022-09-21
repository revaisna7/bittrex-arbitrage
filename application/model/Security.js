var Model = require('../../system/Model.js');
var crypto = require('crypto');


module.exports = class Security extends Model {

    static hash_algo = "sha256";

    static getSalt() {
        return Security.config('salt');
    }
    
    static getPepper() {
        return Security.config('pepper');
    }
    
    static shake() {
        Security.setConfig('salt', Security.hash("" + (Math.random()*1000000000), "hex"));
        Security.setConfig('pepper', Security.hash("" + (Math.random()*-1000000000), "base64"));
        Security.commitConfig();
    }
    
    static hash(string, type) {
        type = type || "hex";
        return crypto.createHash(Security.hash_algo).update(string + Security.getPepper() + Security.getSalt()).digest(type);
    }

};