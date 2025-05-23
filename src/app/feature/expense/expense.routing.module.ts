import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BaseExpenseComponent } from './base-expense.component';

export const routes: Routes = [
  {
    path: '',
    component: BaseExpenseComponent,
    children: [
      {
        path: 'create-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
      },
      {
        path: 'edit-expense/:id',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent)
      },
      {
        path: 'landing',
        loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent),
      },
      {
        path: 'my',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'approval',
        loadComponent: () => import('./approval-dashboard/approval-dashboard.component').then(m => m.ApprovalDashboardComponent),
      },
      {
        path: 'finance',
        loadComponent: () => import('./finance/finance.component').then(m => m.FinanceComponent),
      },
      {
        path:'dashboard',
        loadComponent:()=>import('./dashboard/dashboard.component').then(m=>m.DashboardComponent)
      },
      {
        path:'preview/:id',
        loadComponent:()=>import('./preview/preview.component').then(m=>m.PreviewComponent)
      },
      {
        path:'approval/:id',
        loadComponent:()=>import('./preview/preview.component').then(m=>m.PreviewComponent)
      },
      {
        path:'finance-approval/:id',
        loadComponent:()=>import('./preview/preview.component').then(m=>m.PreviewComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }
