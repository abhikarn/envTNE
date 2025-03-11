import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseService } from '../service/expense-service.service';
import { map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-expense',
  imports: [
    CommonModule,
    MatTabsModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss'
})
export class MainExpenseComponent {
  @ViewChild('datepickerInput', { static: false }) datepickerInput!: ElementRef;
  travelRequests: any;
  travelRequestJsonInfo: any;
  travelModeList: any;
  travelClassList: any;
  originControl = new FormControl('');
  cities = [];
  filteredCities$: Observable<{ CityMasterId: number; City: string }[]>;
  travelPaymentList: any;

  constructor(
    private expenseService: ExpenseService
  ) { 
    this.filteredCities$ = this.originControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => (value?.trim() ? this.expenseService.getCityAuto(value) : of([])))
    );
  }

  ngOnInit() {
    this.fetchPendingTravelRequests();
    this.fetchTravelModeList();
    this.fetchTravelPayemntTypeList();
    this.fetchExpensePolicyEntitlement();
  }

  fetchPendingTravelRequests(): void {
    this.expenseService.getPendingTravelRequests().pipe(take(1)).subscribe({
      next: (response) => {
        this.travelRequests = response;
        console.log('Pending Travel Requests:', this.travelRequests);
      },
      error: (error) => {
        console.error('Error fetching travel requests:', error);
      }
    });
  }

  onSelectTravelExpenseRequest(event: any) {
    let travelRequestId = Number(event.target.value) || 0;
    if (travelRequestId) {
      this.expenseService.getTravelRequestJsonInfo(travelRequestId).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestJsonInfo = response;
        },
        error: (error) => {
          console.error('Error fetching travel request json info:', error);
        }
      })
    }
  }

  fetchTravelModeList() {
    this.expenseService.getTravelModeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.travelModeList = response;
      },
      error: (error) => {
        console.error('Error fetching travel modes:', error);
      }
    })
  }

  onSelectTravelMode(event: any) {
    let travelModeKey = event.target.value || 0;
    if(travelModeKey) {
      this.expenseService.getTravelClassList(travelModeKey).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelClassList = response;
        },
        error: (error) => {
          console.error('Error fetching travel modes:', error);
        }
      })
    }
  }

  fetchTravelPayemntTypeList() {
    this.expenseService.getTravelPaymentType().pipe(take(1)).subscribe({
      next: (response) => {
        this.travelPaymentList = response;
      },
      error: (error) => {
        console.error('Error fetching travel payments:', error);
      }
    })
  }

  fetchExpensePolicyEntitlement() {
    this.expenseService.getExpensePolicyEntitlement().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.error('Error fetching travel payments:', error);
      }
    })
  }

}
