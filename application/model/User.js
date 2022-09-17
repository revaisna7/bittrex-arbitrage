var Model = require('../../system/Model.js');
var Security = require('./Security.js');

module.exports = class User extends Model {

    
    static authenticate(password) {
        return User.config('password') === Security.hash(password);
    }
    
};