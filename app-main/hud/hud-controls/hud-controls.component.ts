import { Component, OnInit } from '@angular/core';

import { HudConfigService } from '../hud-config.service';

@Component({
    selector: 'hud-controls',
    templateUrl: 'app-main/hud/hud-controls/hud-controls.component.html',
    providers: [HudConfigService]
})
export class HudControlsComponent implements OnInit {
    watchFolder: string;

    constructor(private hudConfigService: HudConfigService) { }

    ngOnInit(): void {
        this.watchFolder = this.hudConfigService.folder;
    }

    setWatchFolder(folder:string): void {
        this.hudConfigService.folder = folder;
        this.watchFolder = this.hudConfigService.folder;
    }
}
