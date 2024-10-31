import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
  ],
  declarations: [],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class CoreModule {}
