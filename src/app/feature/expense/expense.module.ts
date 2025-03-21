import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseExpenseComponent } from './base-expense.component';
import { ExpenseRoutingModule } from './expense.routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    BaseExpenseComponent
  ],
  imports: [
    CommonModule,
    ExpenseRoutingModule
  ],
  providers: []
})
export class ExpenseModule { }
