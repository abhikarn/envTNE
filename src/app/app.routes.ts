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
        path: 'expense',
        loadChildren: () => import('./feature/feature.module').then((m) => m.FeatureModule)
    },
    {
        path: 'more',
        loadComponent: () => import('../../src/core/components/mobile-nav/more/more.component').then((m) => m.MoreComponent)
    }
];
