import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseDashboardComponent } from './base-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: BaseDashboardComponent,
    data: { title: 'Dashboard' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'approval-dashboard',
        loadComponent: () =>
          import('./approval-dashboard/approval-dashboard.component').then(m => m.ApprovalDashboardComponent)
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('./preview/preview.component').then(m => m.PreviewComponent)
      },
      {
        path: 'approval-dashboard/:id',
        loadComponent: () =>
          import('./preview/preview.component').then(m => m.PreviewComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
