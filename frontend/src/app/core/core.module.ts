import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { fontAwesomeIcons } from './icons/font-awesome-icons';

@NgModule({
  imports: [
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
  ],
  declarations: [],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class CoreModule {
  constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(...fontAwesomeIcons);
  }
}
