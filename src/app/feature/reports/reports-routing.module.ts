import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseReportsComponent } from './base-reports.component';

const routes: Routes = [
  {
    path: 'base-reports',
    component: BaseReportsComponent,
    data: { title: 'Reports' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReportsRoutingModule {
  
}
