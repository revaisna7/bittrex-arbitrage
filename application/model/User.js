var Model = require('../../system/Model.js');

module.exports = class User extends Model {

    
    static authenticate(password) {
        if(password === User.config('password')) {
            return true;
        }
        return false;
    }
    
};