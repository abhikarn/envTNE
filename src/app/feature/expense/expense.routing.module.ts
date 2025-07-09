import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BaseExpenseComponent } from './base-expense.component';

export const routes: Routes = [
  {
    path: '',
    component: BaseExpenseComponent,
    children: [
      // Travel Expense
      {
        path: 'create-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Travel Expense' }
      },
      {
        path: 'edit-expense/:ExpenseClaimTypeDescription/:id',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Edit Expense' }
      },
      // Local Travel Conveyance
      {
        path: 'create-local-travel-conveyance',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Local Travel Conveyance' }
      },
      // Mobile Handset Purchase
      {
        path: 'create-mobile-handset-purchase',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Mobile Handset Purchase' }
      },
      // Broadband Expense
      {
        path: 'create-broadband-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Broadband Expense' }
      },
      // Mobile Expense
      {
        path: 'create-mobile-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Mobile Expense' }
      },
      // Marriage Gift Expense
      {
        path: 'create-marriage-gift-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Marriage Gift Expense' }
      },
      // Deputation Expense
      {
        path: 'create-deputation-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Deputation Expense' }
      },
      // Direct Expense
      {
        path: 'create-direct-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Direct Expense' }
      },
      // Bereavement Support Claim
      {
        path: 'create-bereavement-support-claim',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Bereavement Support Claim' }
      },
      // Training and Certification Expense
      {
        path: 'create-training-certification-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Training and Certification Expense' }
      },
      // Joining Expense
      {
        path: 'create-joining-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Joining Expense' }
      },
      // Transfer Expense
      {
        path: 'create-transfer-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Transfer Expense' }
      },
      // Relocation Expense
      {
        path: 'create-relocation-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Relocation Expense' }
      },
      // Sales Force Expense
      {
        path: 'create-sales-force-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Sales Force Expense' }
      },
      // Business Entertainment Expense
      {
        path: 'create-business-entertainment-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Business Entertainment Expense' }
      },
      // Other Expense
      {
        path: 'create-other-expense',
        loadComponent: () => import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Other Expense' }
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
