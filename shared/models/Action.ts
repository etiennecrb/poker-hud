import ActionType from './ActionType';
import Player from './Player';

export default class Action {
    constructor(
        public player: Player,
        public type: ActionType,
        public properties: {}
    ) {}
}
