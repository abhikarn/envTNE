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
import { TranslateModule } from '@ngx-translate/core';

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
    ReactiveFormsModule,
    TranslateModule
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
  currencyList: any;
  accomodationTypeList: any;
  baggageTypeList: any;
  otherTypeList: any;
  boMealsList: any;
  localTravelTypeList: any;
  localTravelModeList: any;
  category = '';
  expenseClaimTypeId: any;
  travelRequestBookedDetail: any;
  travelRequestLeaveSummary: any;

  constructor(
    private expenseService: ExpenseService
  ) {
    this.filteredCities$ = this.originControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => (value?.trim() ? this.expenseService.getCityAuto(value) : of([])))
    );
  }

  ngOnInit() {
    this.validateWorkflowExpenseMapped();
    this.fetchGlobalConfigurationJsonData();
    this.fetchPendingTravelRequests();
    this.fetchTravelModeList();
    this.fetchTravelPayemntTypeList();
    this.fetchCurrencyList();
    this.fetchAccomodationTypeList();
    this.fetchBaggageTypeList();
    this.fetchOtherTypeList();
    this.fecthBoMeals();
    this.fetchLocalTravelTypeList();
    this.fecthLocalTravelModeList();
    this.fetchExpensePolicyEntitlement();
  }

  validateWorkflowExpenseMapped() {
    this.expenseService.validateWorkflowExpenseMapped().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error Validate Workflow Expense Mapped', error);
      }
    });
  }

  fetchGlobalConfigurationJsonData() {
    this.expenseService.getGlobalConfigurationJsonData().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching global configuration Json data', error);
      }
    });
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
      // Get Expense Claim Type Id
      this.expenseService.getExpenseClaimType(travelRequestId).pipe(take(1)).subscribe({
        next: (response) => {
          this.expenseClaimTypeId = response.ExpenseClaimTypeId;
        },
        error: (error) => {
          console.error('Error fetching expense claim type:', error);
        }
      })

      // Travel Request Booked Detail
      this.expenseService.GetTravelRequestBookedDetail(travelRequestId).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestBookedDetail = response;
        },
        error: (error) => {
          console.error('Error fetching travel request booked details:', error);
        }
      })

      this.expenseService.getTravelRequestJsonInfo(travelRequestId).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestJsonInfo = response;
        },
        error: (error) => {
          console.error('Error fetching travel request json info:', error);
        }
      })

      this.expenseService.GetTravelRequestLeaveSummary(travelRequestId).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestLeaveSummary = response;
        },
        error: (error) => {
          console.error('Error fetching travel request leave summary:', error);
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
    if (travelModeKey) {
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

  fetchCurrencyList() {
    this.expenseService.getCurrencyList().pipe(take(1)).subscribe({
      next: (response) => {
        this.currencyList = response;
      },
      error: (error) => {
        console.error('Error fetching currency :', error);
      }
    })
  }

  fetchAccomodationTypeList() {
    this.expenseService.getAccomodationTypeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.accomodationTypeList = response;
      },
      error: (error) => {
        console.error('Error fetching accomodation type :', error);
      }
    })
  }

  fetchBaggageTypeList() {
    this.expenseService.getBaggageTypeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.baggageTypeList = response;
      },
      error: (error) => {
        console.error('Error fetching baggage type :', error);
      }
    })
  }

  fetchOtherTypeList() {
    this.expenseService.getOtherTypeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.otherTypeList = response;
      },
      error: (error) => {
        console.error('Error fetching other type :', error);
      }
    })
  }

  fecthBoMeals() {
    this.expenseService.getBoMeals().pipe(take(1)).subscribe({
      next: (response) => {
        this.boMealsList = response;
      },
      error: (error) => {
        console.error('Error fetching bo meals :', error);
      }
    })
  }

  fetchLocalTravelTypeList() {
    this.expenseService.getLocalTravelTypeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.localTravelTypeList = response;
      },
      error: (error) => {
        console.error('Error fetching local travel type :', error);
      }
    })
  }

  fecthLocalTravelModeList() {
    this.expenseService.getLocalTravelModeList().pipe(take(1)).subscribe({
      next: (response) => {
        this.localTravelModeList = response;
      },
      error: (error) => {
        console.error('Error fetching local travel mode :', error);
      }
    })
  }

  fecthApplicationMsg() {
    this.expenseService.getApplicationMessage().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching application message :', error);
      }
    })
  }

  onSelectCheckInDateTime() {
    this.expenseService.getGradeData().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching grade data :', error);
      }
    })
    // To Do: ValidateUserLeaveDateForDuration
    // To Do: GetExpensePolicyEntitlement
  }

  onSelectCheckOutDateTime() {
    // To Do: ValidateUserLeaveDateForDuration
  }

  onSelectCity() {
    this.expenseService.getGradeData().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching grade data :', error);
      }
    })
    // To Do: GetAccommodationTypeList
    // To Do: GetExpensePolicyEntitlement
    this.expenseService.getCurrencyRate().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching currency rate :', error);
      }
    })
    if (this.category == 'Lump sum') {
      // To Do: HolidayEntitlementFactor
    }
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

  onSelectPerDiemConstraint() {
    // Same API calling Like on select city
  }

  onSelectClaimDate() {
    // To Do: ValidateUserLeaveDateForDuration
    if (this.category == 'Miscellaneous Expense') {
      // Same API calling Like on select city
    }
  }

  onSelectLocalConveyanceKM() {
    // To Do: ValidateExpenseClaimLocalTravelConveyance
  }

  fetchCurrencyRate() {
    this.expenseService.getCurrencyRate().pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching currency rate :', error);
      }
    })
  }

  onSelectAmount() {
    this.fetchCurrencyRate();
  }

  onSelectCurrency() {
    this.fetchCurrencyRate();
  }

}
