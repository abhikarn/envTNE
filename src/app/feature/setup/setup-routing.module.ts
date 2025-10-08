import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseSetupComponent } from './base-setup.component';

const routes: Routes = [
  {
    path: '',
    component: BaseSetupComponent,
    data: { title: 'Setup' },
    children: [
      {
        path: '',
        loadComponent: () => import('./main-setup/main-setup.component').then(c => c.MainSetupComponent)
      },
      {
        path: 'expense-policy',
        loadComponent: () => import('./expense-policy/expense-policy.component').then(c => c.ExpensePolicyComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
