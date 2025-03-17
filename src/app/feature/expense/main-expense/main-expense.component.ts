
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
      boMealsList: this.expenseService.getBoMeals(),
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
        this.boMealsList = responses.boMealsList;
        this.categories = [
          {
            name: 'Tickets Expense', formControls: [
              {
                type: 'select',
                name: 'TravelMode',
                label: 'Travel Mode',
                placeholder: 'Select Travel Mode',
                options: this.travelModeList,
                validations: [{ type: 'required', message: 'Travel Mode is required' }]
              },
              {
                type: 'select',
                name: 'AvailedClass',
                label: 'Availed Class',
                placeholder: 'Select Availed Class',
                options: this.localTravelTypeList,
                validations: [{ type: 'required', message: 'Availed Class is required' }]
              },
              {
                type: 'date',
                name: 'TravelDate',
                label: 'Travel Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Travel Date is required' }]
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
                })),
                validations: [{ type: 'required', message: 'Origin is required' }]
              },
              {
                type: 'text',
                name: 'Destination',
                label: 'Destination',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                })),
                validations: [{ type: 'required', message: 'Destination is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'Payment Type',
                placeholder: 'Select Payment Type',
                options: this.travelPaymentList,
                validations: [{ type: 'required', message: 'Payment Type is required' }]
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Currency is required' }]
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount',
                validations: [
                  { type: 'required', message: 'Amount is required' },
                  { type: 'minLength', value: 6, message: 'It should be less than 6 digit'}
                ]
              },
              {
                type: 'text',
                name: 'ConversionRate',
                label: 'Conversion Rate',
                validations: [{ type: 'required', message: 'Conversion Rate is required' }]
              },
              {
                type: 'textarea',
                name: 'Remarks',
                label: 'Remarks'
              }
            ]
          },
          {
            name: 'Accommodation', formControls: [
              {
                type: 'select',
                name: 'AccommodationType',
                label: 'Accommodation Type',
                placeholder: 'Select Accommodation Type',
                options: this.accomodationTypeList,
                validations: [{ type: 'required', message: 'Accommodation Type is required' }]
              },
              {
                type: 'date',
                name: 'Check-inDateTime',
                label: 'Check-in Date Time',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Check-in Date Time is required' }]
              },
              {
                type: 'date',
                name: 'Check-outDateTime',
                label: 'Check-out Date Time',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Check-out Date Time is required' }]
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                })),
                validations: [{ type: 'required', message: 'City is required' }]
              },
              {
                type: 'text',
                name: 'CityGrade',
                label: 'City Grade',
                validations: [{ type: 'required', message: 'City Grade is required' }]
              },
              {
                type: 'text',
                name: 'HotelName',
                label: 'Hotel Name',
                validations: [{ type: 'required', message: 'Hotel Name is required' }]
              },
              {
                type: 'text',
                name: 'BillNumber',
                label: 'Bill Number',
                validations: [{ type: 'required', message: 'Bill Number is required' }]
              },
              {
                type: 'date',
                name: 'BillDate',
                label: 'Bill Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Bill Date is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'Payment Type',
                placeholder: 'Select Payment Type',
                options: this.travelPaymentList,
                validations: [{ type: 'required', message: 'Payment Type is required' }]
              },
              {
                type: 'select',
                name: 'EntitlementCurrency',
                label: 'Entitlement Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Entitlement Currency is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementAmount',
                label: 'Entitlement Amount',
                validations: [{ type: 'required', message: 'Entitlement Amount is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementConversionRate',
                label: 'Entitlement Conversion Rate',
                validations: [{ type: 'required', message: 'Entitlement Conversion Rate is required' }]
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Currency is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedAmount',
                label: 'Claimed Amount',
                validations: [{ type: 'required', message: 'Claimed Amount is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedConversionRate',
                label: 'Claimed Conversion Rate',
                validations: [{ type: 'required', message: 'Claimed Conversion Rate is required' }]
              },
              {
                type: 'text',
                name: 'TaxAmount',
                label: 'Tax Amount'
              },
              {
                type: 'text',
                name: 'DifferentialAmount(INR)',
                label: 'Differential Amount(INR)',
                validations: [{ type: 'required', message: 'Differential Amount is required' }]
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Per Diem', formControls: [
              {
                type: 'date',
                name: 'ClaimFromDate',
                label: 'Claim From Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim From Date is required' }]
              },
              {
                type: 'date',
                name: 'ClaimToDate',
                label: 'Claim To Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim To Date is required' }]
              },
              {
                type: 'select',
                name: 'Constraint',
                label: 'Constraint',
                placeholder: 'Select Per Diem Type',
                options: this.boMealsList,
                validations: [{ type: 'required', message: 'Constraint is required' }]
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                })),
                validations: [{ type: 'required', message: 'City is required' }]
              },
              {
                type: 'text',
                name: 'CityGrade',
                label: 'City Grade',
                validations: [{ type: 'required', message: 'City Grade is required' }]
              },
              {
                type: 'text',
                name: 'BillNumber',
                label: 'Bill Number'
              },
              {
                type: 'date',
                name: 'BillDate',
                label: 'Bill Date',
                value: null, // Default value
              },
              {
                type: 'select',
                name: 'EntitlementCurrency',
                label: 'Entitlement Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Entitlement Currency is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementAmount',
                label: 'Entitlement Amount',
                validations: [{ type: 'required', message: 'Entitlement Amount is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementConversionRate',
                label: 'Entitlement Conversion Rate',
                validations: [{ type: 'required', message: 'Entitlement Conversion Rate is required' }]
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Currency is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedAmount',
                label: 'Claimed Amount',
                validations: [{ type: 'required', message: 'Claimed Amount is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedConversionRate',
                label: 'Claimed Conversion Rate',
                validations: [{ type: 'required', message: 'Claimed Conversion Rate is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'Payment Type',
                placeholder: 'Select Payment Type',
                options: this.travelPaymentList,
                validations: [{ type: 'required', message: 'Payment Type is required' }]
              },
              {
                type: 'text',
                name: 'DifferentialAmount(INR)',
                label: 'Differential Amount(INR)',
                validations: [{ type: 'required', message: 'Differential Amount is required' }]
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Lump sum', formControls: [
              {
                type: 'select',
                name: 'AccommodationType',
                label: 'Accommodation Type',
                placeholder: 'Select Accommodation Type',
                options: this.accomodationTypeList,
                validations: [{ type: 'required', message: 'Accommodation Type is required' }]
              },
              {
                type: 'date',
                name: 'Check-inDateTime',
                label: 'Check-in Date Time',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Check-in Date Time is required' }]
              },
              {
                type: 'date',
                name: 'Check-outDateTime',
                label: 'Check-out Date Time',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Check-out Date Time Time is required' }]
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                })),
                validations: [{ type: 'required', message: 'City is required' }]
              },
              {
                type: 'text',
                name: 'CityGrade',
                label: 'City Grade',
                validations: [{ type: 'required', message: 'City Grade is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'Payment Type',
                placeholder: 'Select Payment Type',
                options: this.travelPaymentList,
                validations: [{ type: 'required', message: 'Payment Type is required' }]
              },
              {
                type: 'select',
                name: 'EntitlementCurrency',
                label: 'Entitlement Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Entitlement Currency is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementAmount',
                label: 'Entitlement Amount',
                validations: [{ type: 'required', message: 'Entitlement Amount is required' }]
              },
              {
                type: 'text',
                name: 'EntitlementConversionRate',
                label: 'Entitlement Conversion Rate',
                validations: [{ type: 'required', message: 'Entitlement Conversion Rate is required' }]
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList,
                validations: [{ type: 'required', message: 'Currency is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedAmount',
                label: 'Claimed Amount',
                validations: [{ type: 'required', message: 'Claimed Amount is required' }]
              },
              {
                type: 'text',
                name: 'ClaimedConversionRate',
                label: 'Claimed Conversion Rate',
                validations: [{ type: 'required', message: 'Claimed Conversion Rate is required' }]
              },
              {
                type: 'text',
                name: 'DifferentialAmount(INR)',
                label: 'Differential Amount(INR)',
                validations: [{ type: 'required', message: 'Differential Amount is required' }]
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Local Conveyance', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'select',
                name: 'LocalTravelType',
                label: 'Local Travel Type',
                options: this.localTravelTypeList
              },
              {
                type: 'select',
                name: 'LocalTravelMode',
                label: 'Local Travel Mode',
                options: this.localTravelModeList
              },
              {
                type: 'text',
                name: 'OriginPointName',
                label: 'Origin Point Name'
              },
              {
                type: 'text',
                name: 'DestinationPointName',
                label: 'Destination Point Name'
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                }))
              },
              {
                type: 'text',
                name: 'CityGrade',
                label: 'City Grade'
              },
              {
                type: 'text',
                name: 'Purpose',
                label: 'Purpose'
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'KM',
                label: 'KM'
              },
              {
                type: 'text',
                name: 'TotalAmount',
                label: 'Total Amount'
              },
              {
                type: 'text',
                name: 'ClaimConversionRate',
                label: 'Claim Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Miscellaneous Expense', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'select',
                name: 'OtherType',
                label: 'Other Type',
                options: this.otherTypeList
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                }))
              },
              {
                type: 'text',
                name: 'CityGrade',
                label: 'City Grade'
              },
              {
                type: 'text',
                name: 'ParticularsofExpense',
                label: 'Particulars of Expense'
              },
              {
                type: 'text',
                name: 'BillNumber',
                label: 'Bill Number'
              },
              {
                type: 'date',
                name: 'BillDate',
                label: 'Bill Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Bill Date Time is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'text',
                name: 'ClaimConversionRate',
                label: 'Claim Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Visa', formControls: [
              {
                type: 'date',
                name: 'ProcessingDate',
                label: 'Processing Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Processing Date is required' }]
              },
              {
                type: 'text',
                name: 'Country',
                label: 'Country'
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'VisaApplicationFee',
                label: 'Visa Application Fee'
              },
              {
                type: 'text',
                name: 'ConversionRate',
                label: 'Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Travel Insurance', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'text',
                name: 'InsuranceType',
                label: 'Insurance Type'
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'text',
                name: 'ConversionRate',
                label: 'Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Roaming', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'text',
                name: 'ServiceProvider',
                label: 'Service Provider'
              },
              {
                type: 'text',
                name: 'Roaming Plan',
                label: 'Roaming Plan'
              },
              {
                type: 'date',
                name: 'ActivationDate',
                label: 'Activation Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Activation Date is required' }]
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'text',
                name: 'ConversionRate',
                label: 'Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Transit Allowance', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'select',
                name: 'NumberofHours',
                label: 'Number of Hours',
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                }))
              },
              {
                type: 'text',
                name: 'Country',
                label: 'Country'
              },
              {
                type: 'text',
                name: 'CountryGrade',
                label: 'Country Grade'
              },
              {
                type: 'select',
                name: 'EntitlementCurrency',
                label: 'Entitlement Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'EntitlementAmount',
                label: 'Entitlement Amount'
              },
              {
                type: 'text',
                name: 'EntitlementConversionRate',
                label: 'Entitlement Conversion Rate'
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'text',
                name: 'ClaimConversionRate',
                label: 'Claim Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Baggage and Outfit Allowance', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'multi-select',
                name: 'Constraint',
                label: 'Constraint'
              },
              {
                type: 'select',
                name: 'EntitlementCurrency',
                label: 'Entitlement Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'EntitlementAmount',
                label: 'Entitlement Amount'
              },
              {
                type: 'text',
                name: 'EntitlementConversionRate',
                label: 'Entitlement Conversion Rate'
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'text',
                name: 'ClaimConversionRate',
                label: 'Claim Conversion Rate'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Porterage Expenses', formControls: [
              {
                type: 'date',
                name: 'ClaimDate',
                label: 'Claim Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Claim Date is required' }]
              },
              {
                type: 'text',
                name: 'City',
                label: 'City',
                option$: this.filteredCities$.pipe(map(p => {
                  return p.map((c) => {
                    return {
                      value: c.City
                    }
                  })
                }))
              },
              {
                type: 'text',
                name: 'ParticularsOfExpense',
                label: 'Particulars Of Expense'
              },
              {
                type: 'select',
                name: 'BaggageType',
                label: 'Baggage Type',
                options: this.baggageTypeList
              },
              {
                type: 'select',
                name: 'PaymentType',
                label: 'PaymentType',
                options: this.travelPaymentList
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
          },
          {
            name: 'Advance Return', formControls: [
              {
                type: 'date',
                name: 'Date',
                label: 'Date',
                value: null, // Default value
                validations: [{ type: 'required', message: 'Date is required' }]
              },
              {
                type: 'select',
                name: 'Currency',
                label: 'Currency',
                options: this.currencyList
              },
              {
                type: 'text',
                name: 'Amount',
                label: 'Amount'
              },
              {
                type: 'textarea',
                name: 'Justification',
                label: 'Justification'
              }
            ]
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