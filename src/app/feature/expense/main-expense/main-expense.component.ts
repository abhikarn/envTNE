import { Component } from '@angular/core';
import { MatTabNav, MatTabsModule } from '@angular/material/tabs';
declare var $: any;
@Component({
  selector: 'app-main-expense',
  imports: [
    MatTabsModule
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss'
})
export class MainExpenseComponent {
  
}
