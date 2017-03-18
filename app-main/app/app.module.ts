import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { NgxElectronModule } from 'ngx-electron';

import { AppComponent } from './app.component';
import { HandHistoryFolderComponent }   from './components/hand-history-folder/hand-history-folder.component';

@NgModule({
  declarations: [
    AppComponent,
    HandHistoryFolderComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    NgxElectronModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
