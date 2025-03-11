import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabNav, MatTabsModule } from '@angular/material/tabs';
import { ExpenseService } from '../service/expense-service.service';
declare var $: any;
@Component({
  selector: 'app-main-expense',
  imports: [
    CommonModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss'
})
export class MainExpenseComponent {
  travelRequests: any;

  constructor(
    private expenseService: ExpenseService
  ){}

  ngOnInit() {
    this.fetchPendingTravelRequests();
  }

  fetchPendingTravelRequests(): void {
    this.expenseService.getPendingTravelRequests().subscribe({
      next: (response) => {
        this.travelRequests = response;
        console.log('Pending Travel Requests:', this.travelRequests);
      },
      error: (error) => {
        console.error('Error fetching travel requests:', error);
      }
    });
  }
  
}
