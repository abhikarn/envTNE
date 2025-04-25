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
        path:'dashboard',
        loadComponent:()=>import('./dashboard/dashboard.component').then(m=>m.DashboardComponent)
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
