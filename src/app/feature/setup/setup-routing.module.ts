import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseSetupComponent } from './base-setup.component';

const routes: Routes = [
  {
    path: 'base-setup',
    component: BaseSetupComponent,
    data: { title: 'Setup' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
