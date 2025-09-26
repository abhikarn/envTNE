import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseFinanceComponent } from './base-finance.component';

const routes: Routes = [
  {
    path: '',
    component: BaseFinanceComponent,
    data: { title: 'Finance' },
    children: [
      {
        path: 'settlement',
        loadComponent: () =>
          import('../finance/finance/finance.component').then(m => m.FinanceComponent)
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('../dashboard/preview/preview.component').then(m => m.PreviewComponent)
      },
      {
        path: 'approval-dashboard/:id',
        loadComponent: () =>
          import('../dashboard/preview/preview.component').then(m => m.PreviewComponent)
      },
      {
        path: 'finance-approval/:id',
        loadComponent: () =>
          import('../dashboard/preview/preview.component').then(m => m.PreviewComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
