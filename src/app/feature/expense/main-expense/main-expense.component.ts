
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseService } from '../service/expense-service.service';
import { catchError, forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../../shared/dynamic-form/form-control.interface';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-main-expense',
  imports: [
    MatTabsModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    DynamicFormComponent
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
  travelDetails = [
    {
      label: 'Travel From Date',
      value: '25-Mar-2024 18:56',
      id: 'TravelFromDate',
      hidden: false
    },
    {
      label: 'CostCentre',
      value: 'COO - Office [ 16050 ]',
      id: 'txtOtherCostCentre',
      hidden: false,
      hiddenFields: [
        { id: 'hdnCostCentreId', value: '1' },
        { id: 'hdnCostCentre', value: 'COO - Office [ 16050 ]' }
      ]
    },
    {
      label: 'LeaveSummary',
      value: '26-Mar-2024 - 27-Mar-2024 | Personnel leave',
      id: 'spanleaveSummary',
      hidden: false
    },
    {
      label: 'Travel To Date Time',
      value: '29-Mar-2024 23:59',
      id: 'TravelToDate',
      hidden: false
    },
    {
      label: 'Purpose Of Travel',
      value: 'Residential Program',
      id: 'spanPurposeOfTravel',
      hidden: false,
      hiddenFields: [
        { id: 'hdnPurposeOfTravel', value: '0' }
      ]
    },
    {
      label: 'Internal Order',
      value: '',
      id: 'txInternalOrder',
      hidden: true
    }
  ];
  tabs = [
    { label: 'Miscellaneous Expense', content: 'Content for Miscellaneous Expense' },
    { label: 'Visa', content: 'Content for Visa' },
    { label: 'Travel Insurance', content: 'Content for Travel Insurance' },
    { label: 'Roaming', content: 'Content for Roaming' },
    { label: 'Transit Allowance', content: 'Content for Transit Allowance' },
    { label: 'Baggage and Outfit Allowance', content: 'Content for Baggage and Outfit Allowance' },
    { label: 'Porterage Expenses', content: 'Content for Porterage Expenses' },
    { label: 'Advance Return', content: 'Content for Advance Return' }
  ];
  categories: { name: string; formControls: IFormControl[] }[] = [];
  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder
  ) {
    this.filteredCities$ = this.originControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => (value?.trim() ? this.expenseService.getCityAuto(value) : of([])))
    );
  }

  ngOnInit() {
    forkJoin({
      pendingTravelRequests: this.expenseService.getPendingTravelRequests(),
      travelModeList: this.expenseService.getTravelModeList(),
      travelPaymentTypeList: this.expenseService.getTravelPaymentType(),
      currencyList: this.expenseService.getCurrencyList(),
      accommodationTypeList: this.expenseService.getAccomodationTypeList(),
      baggageTypeList: this.expenseService.getBaggageTypeList(),
      otherTypeList: this.expenseService.getOtherTypeList(),
      boMeals: this.expenseService.getBoMeals(),
      localTravelTypeList: this.expenseService.getLocalTravelTypeList()
      // localTravelModeList: this.expenseService.getLocalTravelModeList(),
    }).subscribe({
      next: (responses) => {
        // Handle all the API responses here
        console.log('responses', responses);
        this.travelRequests = responses.pendingTravelRequests;
        this.travelModeList = responses.travelModeList;
        this.travelPaymentList = responses.travelPaymentTypeList;
        this.currencyList = responses.currencyList;
        this.accomodationTypeList = responses.accommodationTypeList;
        this.baggageTypeList = responses.baggageTypeList;
        this.localTravelTypeList = responses.localTravelTypeList;
        this.categories = [
          {
            name: 'Miscellaneous Expense', formControls: [
              {
                type: 'select',
                name: 'TravelMode',
                label: 'Travel Mode',
                options: this.travelModeList
              },
              {
                type: 'select',
                name: 'TravelClass',
                label: 'Availed Class',
                options: this.localTravelTypeList
              },
              {
                type: 'text',
                name: 'Origin',
                label: 'Origin',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                }))
              }
            ]
          },
          {
            name: 'Visa', formControls: []
          },
          {
            name: 'Travel Insurance', formControls: []
          },
          {
            name: 'Roaming', formControls: []
          },
          {
            name: 'Transit Allowance', formControls: []
          },
          {
            name: 'Baggage and Outfit Allowance', formControls: []
          },
          {
            name: 'Porterage Expenses', formControls: []
          },
          {
            name: 'Advance Return', formControls: []
          }
        ];
        // this.localTravelModeList = responses.localTravelModeList;
        console.log('categories', this.categories);
      },
      error: (err) => {
        // Handle any errors
        console.error(err);
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
