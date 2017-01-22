import { app } from 'electron';
import * as path from 'path';

export default {
    getAppDataPath: getAppDataPath
};

function getAppDataPath():string {
    return path.join(app.getPath('appData'), 'poker-hud');
}
