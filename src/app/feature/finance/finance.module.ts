import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { BaseFinanceComponent } from './base-finance.component';


@NgModule({
  declarations: [
    BaseFinanceComponent
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule
  ]
})
export class FinanceModule { }
