import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare const reactiveIpcRenderer: any;

@Component({
    selector: 'hand-history-config',
    templateUrl: 'app-main/hand-history-config/hand-history-config.component.html'
})
export class HandHistoryConfigComponent implements OnInit {
    handHistoryFolders: Array<any>;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        reactiveIpcRenderer.send('config/handHistoryFolders/get')
            .subscribe((handHistoryFolders) => {
                this.handHistoryFolders = handHistoryFolders;
                console.log(handHistoryFolders);
                this.changeDetectorRef.detectChanges();
            });
    }

    addHandHistory(room:string, path:string): void {
        reactiveIpcRenderer.send('config/handHistoryFolders/add', { room, path })
            .subscribe((handHistoryFolders) => {
                this.handHistoryFolders = handHistoryFolders;
                console.log(handHistoryFolders);
                this.changeDetectorRef.detectChanges();
            });
    }

    removeHandHistory(room:string, path:string): void {
        reactiveIpcRenderer.send('config/handHistoryFolders/delete', { room, path })
            .subscribe((handHistoryFolders) => {
                this.handHistoryFolders = handHistoryFolders;
                console.log(handHistoryFolders);
                this.changeDetectorRef.detectChanges();
            });
    }
}
