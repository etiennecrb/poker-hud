import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }   from './app.component';
import { HandHistoryConfigComponent }   from './hand-history-config/hand-history-config.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [
      AppComponent,
      HandHistoryConfigComponent
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
