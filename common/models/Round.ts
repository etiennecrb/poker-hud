import Card from './Card'
import Action from './Action'

export default class Round {
    constructor(
        public cards: Card[],
        public actions: Action[]
    ) {}
}
