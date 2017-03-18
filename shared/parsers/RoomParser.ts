import * as readline from 'readline';
import * as Rx from 'rxjs';

import Hand from '../models/Hand';

interface RoomParser {
    // TODO: Use Rx.Observable instead of promise
    parse(rl: readline.ReadLine): Promise<Hand[]>
}

export default RoomParser;
