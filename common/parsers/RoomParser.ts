import * as readline from 'readline';
import * as Rx from 'rxjs';

import Hand from '../models/Hand';

interface RoomParser {
    parse(rl: readline.ReadLine): Rx.Observable<Hand>
}

export default RoomParser;
