import { Component } from '@angular/core';
declare const reactiveIpcRenderer: any;

@Component({
    selector: 'my-app',
    template: '<hand-history-config></hand-history-config>'
})
export class AppComponent {
    constructor() {
        reactiveIpcRenderer.send('test', 6)
            .subscribe((result) => {
                console.log(result);
            });
    }
}
