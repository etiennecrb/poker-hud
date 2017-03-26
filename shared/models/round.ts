import Card from './card'
import Action from './action'

export default class Round {
    constructor(
        public cards: Card[],
        public actions: Action[]
    ) {}
}
