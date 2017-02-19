import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '@angular/material';

import { AppComponent }   from './app.component';
import { HandHistoryFolderComponent }   from './components/hand-history-folder/hand-history-folder.component';

@NgModule({
    imports:      [ MaterialModule, BrowserModule ],
    declarations: [
        AppComponent,
        HandHistoryFolderComponent
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }
