import * as fs from 'fs';
import * as readline from 'readline';
import * as Rx from 'rxjs';

import { parse as winamaxParser } from './parser-winamax';
import Hand from '../models/hand';

const roomToParser: {[i: string]: Function} = {
    winamax: winamaxParser
}

export function parseFile(room: string, pathToFile: string): Promise<Hand[]> {
    if (!roomToParser[room]) {
        throw `no parser registered for room ${room}`;
    }
    const rl = readline.createInterface({
        input: fs.createReadStream(pathToFile)
    });
    return roomToParser[room](rl);
}
