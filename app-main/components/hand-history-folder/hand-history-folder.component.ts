import {Component, Input, Output, EventEmitter} from '@angular/core';
import HandHistoryFolder from "../../../main-process/Config/HandHistoryFolder";

@Component({
    selector: 'hand-history-folder',
    templateUrl: 'components/hand-history-folder/hand-history-folder.component.html',
    styleUrls: ['components/hand-history-folder/hand-history-folder.component.css']
})
export class HandHistoryFolderComponent {
    @Input() value: HandHistoryFolder;
    @Output() onChange = new EventEmitter();

    changeFolder(path:string): void {
        this.onChange.emit({room: 'winamax', pathToFolder: path});
    }
}
