import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseExpenseComponent } from './base-expense.component';
import { ExpenseRoutingModule } from './expense.routing.module';
import { RouterModule } from '@angular/router';
import { ExpenseService } from './service/expense-service.service';



@NgModule({
  declarations: [
    BaseExpenseComponent
  ],
  imports: [
    CommonModule,
    ExpenseRoutingModule
  ],
  providers: [ExpenseService]
})
export class ExpenseModule { }
