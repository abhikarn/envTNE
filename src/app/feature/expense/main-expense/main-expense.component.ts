
import { Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DataService, ExpenseService, TravelService } from '../../../../../tne-api';
import { forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../../shared/dynamic-form/form-control.interface';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-expense',
  imports: [
    MatTabsModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    DynamicFormComponent
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss'
})
export class MainExpenseComponent {
  @ViewChild('datepickerInput', { static: false }) datepickerInput!: ElementRef;
  travelRequests: any;
  travelRequestBookedDetail: any;
  travelRequestPreview: any;
  travelModeList: any;
  travelClassList: any;
  originControl = new FormControl('');
  cities = [];
  // filteredCities$: Observable<{ CityMasterId: number; City: string }[]>;
  travelPaymentList: any;
  currencyList: any;
  accomodationTypeList: any;
  baggageTypeList: any;
  otherTypeList: any;
  boMealsList: any;
  localTravelTypeList: any;
  localTravelModeList: any;
  private destroyRef = inject(DestroyRef);
  categories: { name: string; formControls: IFormControl[] }[] = [];
  mainExpenseData: any = {
    expenseRequestDetailType: []
  };

  constructor(
    private expenseService: ExpenseService,
    private dataService: DataService,
    private travelService:TravelService,
    private http: HttpClient
  ) {
    // this.filteredCities$ = this.originControl.valueChanges.pipe(
    //   startWith(''),
    //   switchMap(value => {
    //     const param: CityAutocompleteParam = { SearchText: value?.trim() }; // Adjust key name as needed
    //     return value?.trim() ? this.dataService.dataGetCityAutocomplete(param) : of([]);
    //   })
    // );
  }

  ngOnInit() {
    forkJoin({
      pendingTravelRequests: this.expenseService.expenseGetTravelRequestsPendingForClaim({ UserMasterId: 4, TravelTypeId: 0}),
      travelModeList: this.dataService.dataGetTravelMode(),
      travelPaymentTypeList: this.dataService.dataGetPaymentType(),
      currencyList: this.dataService.dataGetCurrencyView(),
      accommodationTypeList: this.dataService.dataGetStayType(),
      baggageTypeList: this.dataService.dataGetBaggageType(),
      // otherTypeList: this.expenseService.getOtherTypeList(),
      boMealsList: this.dataService.dataGetMealType(),
      localTravelTypeList: this.dataService.dataGetLocalTravelType(),
      localTravelModeList: this.dataService.dataGetLocalTravelMode(),
      expenseConfig: this.http.get<{ name: string; formControls: IFormControl[] }[]>('/assets/config/expense-config.json')
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (responses) => {
        // Handle all the API responses here
        console.log('responses', responses);
        this.travelRequests = responses.pendingTravelRequests.ResponseValue;
        this.travelModeList = responses.travelModeList.ResponseValue;
        this.travelPaymentList = responses.travelPaymentTypeList.ResponseValue;
        this.currencyList = responses.currencyList.ResponseValue;
        this.accomodationTypeList = responses.accommodationTypeList.ResponseValue;
        this.baggageTypeList = responses.baggageTypeList.ResponseValue;
        this.localTravelTypeList = responses.localTravelTypeList.ResponseValue;
        this.localTravelModeList = responses.localTravelModeList.ResponseValue;
        this.boMealsList = responses.boMealsList.ResponseValue;

        const optionMapping: { [key: string]: any[] } = {
          TravelMode: this.travelModeList,
          PaymentType: this.travelPaymentList,
          Currency: this.currencyList,
          AccommodationType: this.accomodationTypeList,
          BaggageType: this.baggageTypeList,
          // OtherType: responses.otherTypeList.ResponseValue,
          BoMeals: this.boMealsList,
          LocalTravelType: this.localTravelTypeList,
          LocalTravelMode: this.localTravelModeList
        };
        this.categories = responses.expenseConfig.map(category => ({
          ...category,
          formControls: category.formControls.map(control => ({
            ...control,
            options: optionMapping[control.name] || control.options,
            // option$: typeof control.option$ === 'string' && control.option$ === 'filteredCities$'
            //   ? this.filteredCities$.pipe(map(cities => cities.map(c => ({ value: c.City }))))
            //   : undefined
          }))
        }));

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
      this.travelService.travelGetTravelRequestPreview({TravelRequestId: travelRequestId}).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestPreview = response.ResponseValue;
        },
        error: (error) => {
          console.error('Error fetching travel request preview:', error);
        }
      })

      this.expenseService.expenseGetTravelRequestBookedDetail({TravelRequestId: travelRequestId}).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestBookedDetail = response.ResponseValue;
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
      this.dataService.dataGetTravelClass({TravelModeId:travelModeKey}).pipe(take(1)).subscribe({
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
    const requestBody = {
      ClaimTypeId: 53,
      UserMasterId: 4,
      ExpenseCategoryId: 3,
      ReferenceDate: '06-Mar-2024',
      CityGradeId: 8,
      CountryGradeId: 0,
      PolicyReferenceId: 53,
      TravelRequestId: 37
    };
    this.expenseService.expenseGetExpensePolicyEntitlement(requestBody).pipe(take(1)).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.error('Error fetching travel payments:', error);
      }
    })
  }

  onTravelModeChange(event: any, field: any) {
    const selectedTravelModeId = event.value;
    console.log(`Selected ${field.name}:`, selectedTravelModeId);

    if (!selectedTravelModeId) {
      console.warn('No Travel Mode selected, skipping update.');
      return;
    }

    this.dataService.dataGetTravelClass({TravelModeId:selectedTravelModeId}).pipe(take(1)).subscribe({
      next: (travelClasses) => {
        this.travelClassList = travelClasses.ResponseValue;

        // Update only the relevant control instead of replacing the whole categories array
        this.categories.forEach(category => {
          category.formControls.forEach(control => {
            if (control.name === 'AvailedClass') {
              control.options = this.travelClassList; // Update only options, avoid object replacement
            }
          });
        });

        console.log('Updated Travel Class Options:', travelClasses);
      },
      error: (error) => {
        console.error('Error fetching travel class list:', error);
      }
    });
  }

  getFormData(categoryFormData: any) {
    let data = categoryFormData.data;
    if(categoryFormData.category == 'Tickets Expense') {
      const requestBody = {
        "UserMasterId": 4,
        "TravelTypeId": this.travelRequestPreview.TravelTypeId,
        "TravelModeId": data.TravelMode,
        "TravelClassId": data.AvailedClass,
        "RequestForId": this.travelRequestPreview.RequestForId,
        "FromCityId": data.Origin,
        "ToCityId": data.Destination,
        "ReferenceDate": data.TravelDate,
        "TravelRequestGroupType": [
          {
            "UserMasterId": 0,
            "IsGroupLeader": true
          }
        ]
      }
      this.travelService.travelValidateTravelTicketPolicy(requestBody).pipe(take(1)).subscribe({
        next: (response) => {
          console.log(response);
        }
      })
    }
    this.mainExpenseData.expenseRequestDetailType.push(categoryFormData.data);
    console.log(this.mainExpenseData);
  }

  getTextData(inputData: any) {
    const requestBody = {
      "SearchText": inputData,
      "TravelTypeId": this.travelRequestPreview.TravelTypeId
    }
    this.dataService.dataGetCityAutocomplete(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {
        // Update only the relevant control instead of replacing the whole categories array
        this.categories.forEach(category => {
          category.formControls.forEach(control => {
            if (control.autoComplete) {
              control.options = response.ResponseValue; // Update only options, avoid object replacement
            }
          });
        });
      }
    })
  }

}