const fp = require('lodash/fp');

class Hand {

    /**
     * Constructor of class Hand.
     * @param {string} id
     * @param {Date} date
     * @param {object} playerBySeat - Object whose keys are seat number and values corresponding Player
     * @param {number} buttonSeat
     * @param {Round[]} rounds
     */
    constructor(id, date, playerBySeat, buttonSeat, rounds) {
        this.id = id;
        this.date = date;
        this.playerBySeat = playerBySeat;
        this.buttonSeat = buttonSeat;
        this.rounds = rounds;
    }

    getBlindsRound() {
        return this.rounds[0];
    }

    getBigBlindPlayer() {
        return fp.get('player')(fp.find(this.getBlindsRound().actions, {'type': 'BIG_BLIND'}));
    }

    getPreFlop() {
        return this.rounds[1];
    }
}

module.exports = Hand;