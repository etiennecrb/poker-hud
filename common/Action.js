/*
Actions: properties
  - ANTE: value
  - SMALL_BLIND: value
  - BIG_BLIND: value
  - CHECK
  - CALL: value,
  - BET: value,
  - RAISE: value, total
  - FOLD
  - SHOW: cards
  - COLLECT: value
 */

class Action {

    /**
     * Constructor of class Action.
     * @param {Player} player
     * @param {string} type
     * @param {object} [properties={}]
     */
    constructor(player, type, properties) {
        this.player = player;
        this.type = type;
        this.properties = properties || {};
    }
}

module.exports = Action;
