import { Component } from '@angular/core';

@Component({
    selector: 'hand-history-folder',
    templateUrl: 'components/hand-history-folder/hand-history-folder.component.html'
})
export class HandHistoryFolderComponent {
    handHistoryFolder: {room: string, path: string};

    constructor() {}

    changeFolder(room:string, path:string): void {
    }
}
