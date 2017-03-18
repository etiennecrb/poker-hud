import {Component, Input, Output, EventEmitter} from '@angular/core';
import HandHistoryFolder from "../../../../electron/Config/HandHistoryFolder";

@Component({
    selector: 'hand-history-folder',
    templateUrl: 'hand-history-folder.component.html',
    styleUrls: ['hand-history-folder.component.css']
})
export class HandHistoryFolderComponent {
    @Input() value: HandHistoryFolder;
    @Output() onChange = new EventEmitter();

    changeFolder(path:string): void {
        this.onChange.emit({room: 'winamax', pathToFolder: path});
    }
}
