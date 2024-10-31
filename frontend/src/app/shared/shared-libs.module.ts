import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  exports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
})
export class SharedLibsModule {}
