import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expense-policy',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './expense-policy.component.html',
  styleUrl: './expense-policy.component.scss'
})
export class ExpensePolicyComponent {

}
