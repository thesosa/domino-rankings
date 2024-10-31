import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { CoreModule } from './core/core.module';
import { MatchFormComponent } from './match-form/match-form.component';
import { SharedModule } from './shared/shared.module';
import { MatchListComponent } from './match-list/match-list.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  exports: [],
  declarations: [
    AppComponent,
    MatchFormComponent,
    MatchListComponent,
    AutocompleteComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {}
}
