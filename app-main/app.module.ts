import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }   from './app.component';
import { HudControlsComponent }   from './hud/hud-controls/hud-controls.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [
      AppComponent,
      HudControlsComponent
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
