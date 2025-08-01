import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BaseExpenseComponent } from './base-expense.component';

// Dynamic route definitions from JSON-like config
const dynamicExpenseRoutes = [
  { title: 'Travel Expense', path: 'create-expense' },
  { title: 'Local Travel Conveyance', path: 'create-local-travel-conveyance' },
  { title: 'Mobile Handset Purchase', path: 'create-mobile-handset-purchase' },
  { title: 'Data Card Broadband', path: 'create-broadband-expense' },
  { title: 'Mobile Expense', path: 'create-mobile-expense' },
  { title: 'Marriage Gift', path: 'create-marriage-gift-expense' },
  { title: 'Deputation Claim', path: 'create-deputation-expense' },
  { title: 'Direct Expense Domestic', path: 'create-direct-expense-domestic' },
  { title: 'Direct Expense International', path: 'create-direct-expense-international' },
  { title: 'Bereavement Support Claim', path: 'create-bereavement-support-claim' },
  { title: 'Training and Certification Expense', path: 'create-training-certification-expense' },
  { title: 'Joining Expense', path: 'create-joining-expense' },
  { title: 'Transfer Expense', path: 'create-transfer-expense' },
  { title: 'Relocation Expense', path: 'create-relocation-expense' },
  { title: 'Sales Force Expense', path: 'create-sales-force-expense' },
  { title: 'Business Entertainment Expense', path: 'create-business-entertainment-expense' },
  { title: 'Other Expense', path: 'create-other-expense' }
];

// Final routes array
export const routes: Routes = [
  {
    path: '',
    component: BaseExpenseComponent,
    children: [
      // Dynamic expense creation routes
      ...dynamicExpenseRoutes.map(item => ({
        path: item.path,
        loadComponent: () =>
          import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: item.title }
      })),

      // Static and edit/preview/approval routes
      {
        path: 'edit-expense/:ExpenseClaimTypeDescription/:id',
        loadComponent: () =>
          import('./main-expense/main-expense.component').then(m => m.MainExpenseComponent),
        data: { title: 'Edit Expense' }
      },
      {
        path: 'landing',
        loadComponent: () =>
          import('./landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'my',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'approval',
        loadComponent: () =>
          import('./approval-dashboard/approval-dashboard.component').then(m => m.ApprovalDashboardComponent)
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./finance/finance.component').then(m => m.FinanceComponent)
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('./preview/preview.component').then(m => m.PreviewComponent)
      },
      {
        path: 'approval/:id',
        loadComponent: () =>
          import('./preview/preview.component').then(m => m.PreviewComponent)
      },
      {
        path: 'finance-approval/:id',
        loadComponent: () =>
          import('./preview/preview.component').then(m => m.PreviewComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'landing', pathMatch: 'full' }
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
