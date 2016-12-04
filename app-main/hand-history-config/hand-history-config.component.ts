import { Component, OnInit } from '@angular/core';

import { HandHistoryConfig } from './hand-history-config';

@Component({
    selector: 'hand-history-config',
    templateUrl: 'app-main/hand-history-config/hand-history-config.component.html',
    providers: [HandHistoryConfig]
})
export class HandHistoryConfigComponent implements OnInit {
    handHistories: Array<any>;

    constructor(private handHistoryConfig: HandHistoryConfig) { }

    ngOnInit(): void {
        this.handHistories = this.handHistoryConfig.getAll();
    }

    addHandHistory(room:string, path:string): void {
        this.handHistoryConfig.setHandHistory({ room, path });
        this.handHistories = this.handHistoryConfig.getAll();
    }

    removeHandHistory(handHistory): void {
        this.handHistoryConfig.removeHandHistory(handHistory);
        this.handHistories = this.handHistoryConfig.getAll();
    }
}
