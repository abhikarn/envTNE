import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'account/login',
        pathMatch: 'full'
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.module').then((m) => m.AccountModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./feature/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'expense',
        loadChildren: () => import('./feature/expense/expense.module').then(m => m.ExpenseModule)
    },
    {
        path: 'setup',
        loadChildren: () => import('./feature/setup/setup.module').then(m => m.SetupModule)
    },
    {
        path: 'reports',
        loadChildren: () => import('./feature/reports/reports.module').then(m => m.ReportsModule)
    },
    {
        path: 'master',
        loadChildren: () => import('./feature/master/master.module').then(m => m.MasterModule)
    },
    {
        path: 'finance',
        loadChildren: () => import('./feature/finance/finance.module').then(m => m.FinanceModule)
    },
    {
        path: 'more',
        loadComponent: () => import('../../src/core/components/mobile-nav/more/more.component').then((m) => m.MoreComponent)
    }
];
