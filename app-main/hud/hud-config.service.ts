import { Injectable } from '@angular/core';

@Injectable()
export class HudConfigService {
    private _folder:string;

    get folder(): string {
        return this._folder;
    }

    set folder(folder:string) {
        this._folder = folder;
    }
}
