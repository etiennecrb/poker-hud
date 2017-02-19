import { Component, OnInit } from '@angular/core';
import { ConfigService } from './common/config.service';
import HandHistoryFolder from "../main-process/Config/HandHistoryFolder";

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    providers: [ ConfigService ]
})
export class AppComponent implements OnInit {
    handHistoryFolder: HandHistoryFolder;

    constructor(private configService: ConfigService) {}

    ngOnInit(): void {
        this.configService.get()
            .then((config) => {
                if (config.handHistoryFolders && config.handHistoryFolders.length) {
                    this.handHistoryFolder = config.handHistoryFolders[0];
                }
            });
    }

    handleHandHistoryFolderChange(handHistoryFolder: HandHistoryFolder): void {
        this.configService.setHandHistoryFolder(handHistoryFolder)
            .then((config) => {
                if (config.handHistoryFolders && config.handHistoryFolders.length) {
                    this.handHistoryFolder = config.handHistoryFolders[0];
                }
            });
    }
}
