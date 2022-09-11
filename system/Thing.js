var Configurable = require('./Configurable.js');

module.exports = class Thing extends Configurable {

    /**
     * @static
     * @property {Array|Thing[]} List of this thing
     */
    static list = [];

    /**
     * Push a thing to the list of things
     * @param {Thing} thing Thing to add to the list of things
     * @returns {undefined}
     */
    static push(thing) {
        this.list.push(thing);
    }
    
};