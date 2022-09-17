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
        var randSalt = "" + (Math.random()*1000000000);
        var randPepper = "" + (Math.random()*1000000000);
        Security.setConfig('salt', Security.hash(randSalt, "hex"));
        Security.setConfig('pepper', Security.hash(randSalt, "base64"));
        Security.commitConfig();
    }
    
    static hash(string, type) {
        type = type || "hex";
        return crypto.createHash(Security.hash_algo).update(string + Security.getPepper() + Security.getSalt()).digest(type);
    }

};