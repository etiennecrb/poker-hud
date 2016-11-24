class Round {

    /**
     * Constructor of class Round.
     * @param {Hand} hand
     * @param {Card[]} cards
     * @param {Action[]} actions
     */
    constructor(hand, cards, actions) {
        this.hand = hand;
        this.cards = cards;
        this.actions = actions;
    }
}

module.exports = Round;