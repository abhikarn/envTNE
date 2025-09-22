import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseMasterComponent } from './base-master.component';

const routes: Routes = [
  {
    path: 'base-master',
    component: BaseMasterComponent,
    data: { title: 'Master' }
  }
];

@NgModule({
  declarations: [
    BaseMasterComponent
  ],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
