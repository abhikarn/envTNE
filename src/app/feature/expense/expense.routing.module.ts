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
        path: 'landing',
        loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent),
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
