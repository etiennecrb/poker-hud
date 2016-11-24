class Card {

    /**
     * Constructor of class Card.
     * @param {string} string
     */
    constructor(string) {
        this.value = string[0];
        this.color = string[1];
    }
}

module.exports = Card;