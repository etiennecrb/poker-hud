const fs = require('fs');
const readline = require('readline');
const winamax = require('./winamax.js');

const parseFileMap = {
    winamax: winamax
}

module.exports = {
    parseFile(room, pathToFile) {
        if (!parseFileMap[room]) {
            throw `no parser registered for room ${room}`;
        }
        const rl = readline.createInterface({
	        input: fs.createReadStream(pathToFile)
	    });
        return parseFileMap[room](rl);
    }
}
