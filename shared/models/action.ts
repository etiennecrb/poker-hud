import ActionType from './action-type';
import Player from './player';

export default class Action {
    constructor(
        public player: Player,
        public type: ActionType,
        public properties: {}
    ) {}
}
