import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FeatureComponent } from './feature.component';

export const routes: Routes = [
   {
      path: '',
      component: FeatureComponent,
      children: [
        {
          path: 'expense',
          loadChildren: () => import('./expense/expense.module').then(m => m.ExpenseModule)
        },
      ]
    },
 
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
