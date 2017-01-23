import * as fs from 'fs';
import * as readline from 'readline';
import * as Rx from 'rxjs';

import WinamaxParser from './WinamaxParser';
import Hand from '../models/Hand';

class Parser {
    private static roomToParser: {} = {
        winamax: WinamaxParser
    };

    static parseFile(room: string, pathToFile: string): Rx.Observable<Hand> {
        if (!Parser.roomToParser[room]) {
            throw `no parser registered for room ${room}`;
        }
        const rl = readline.createInterface({
	        input: fs.createReadStream(pathToFile)
	    });
        return Parser.roomToParser[room].parse(rl);
    }
}

export default Parser;
