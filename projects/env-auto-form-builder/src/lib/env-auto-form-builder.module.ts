import { NgModule } from '@angular/core';
import { EnvAutoFormBuilderComponent } from './env-auto-form-builder.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EnvAutoFormBuilderComponent
  ],
  imports: [
    ReactiveFormsModule
  ],
  exports: [
    EnvAutoFormBuilderComponent
  ]
})
export class EnvAutoFormBuilderModule { }
