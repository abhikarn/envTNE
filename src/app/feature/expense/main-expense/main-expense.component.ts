
import { Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DataService, ExpenseRequestModel, ExpenseService, TravelService } from '../../../../../tne-api';
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
import { SnackbarService } from '../../../shared/service/snackbar.service';
import { ConfirmDialogService } from '../../../shared/service/confirm-dialog.service';

interface DataEntry {
  parentId: number;
  data: any;
}

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
  categories: any = [];
  mainExpenseData: ExpenseRequestModel = {};
  costcenterId: any;
  purpose: any;
  expenseRequestData: any = [];
  travelRequestId: number = 0;
  private dialogOpen = false;

  constructor(
    private expenseService: ExpenseService,
    private dataService: DataService,
    private travelService: TravelService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private eRef: ElementRef
  ) {
    
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const dropdown = this.eRef.nativeElement.querySelector('#ddlTravelExpenseRequest');
    
    if (!this.dialogOpen && dropdown && !dropdown.contains(event.target) && this.travelRequestId == 0) {
      this.dialogOpen = true;
      this.confirmDialogService
        .confirm({
          title: 'Travel Request',
          message: 'Please select a Travel Request.',
          confirmText: 'Ok',
        })
        .subscribe(() => {
          this.dialogOpen = false; 
        });
    }
  }

  ngOnInit() {
    forkJoin({
      pendingTravelRequests: this.expenseService.expenseGetTravelRequestsPendingForClaim({ UserMasterId: 4, TravelTypeId: 0 }),
      travelPaymentTypeList: this.dataService.dataGetPaymentType(),
      currencyList: this.dataService.dataGetCurrencyView(),
      accommodationTypeList: this.dataService.dataGetStayType(),
      baggageTypeList: this.dataService.dataGetBaggageType(),
      // otherTypeList: this.expenseService.getOtherTypeList(),
      boMealsList: this.dataService.dataGetMealType(),
      localTravelTypeList: this.dataService.dataGetLocalTravelType(),
      localTravelModeList: this.dataService.dataGetLocalTravelMode(),
      expenseConfig: this.http.get<any>('/assets/config/expense-config.json')
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (responses) => {
        // Handle all the API responses here
        console.log('responses', responses);
        this.travelRequests = responses.pendingTravelRequests.ResponseValue;
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
        this.categories = responses.expenseConfig.map((category: any) => ({
          ...category,
          formControls: category.formControls.map((control: any) => ({
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
    this.travelRequestId = Number(event.target.value) || 0;
    if (this.travelRequestId) {
      this.travelService.travelGetTravelRequestPreview({ TravelRequestId: this.travelRequestId }).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestPreview = response.ResponseValue;
          this.costcenterId = this.travelRequestPreview.TravelRequestMetaData.find((data: any) => data.TravelRequestMetaId === 4)?.IntegerValue;
          this.purpose = this.travelRequestPreview.TravelRequestMetaData.find((data: any) => data.TravelRequestMetaId === 1)?.IntegerValueReference;

        },
        error: (error) => {
          console.error('Error fetching travel request preview:', error);
        }
      })

      this.expenseService.expenseGetTravelRequestBookedDetail({ TravelRequestId: this.travelRequestId }).pipe(take(1)).subscribe({
        next: (response) => {
          this.travelRequestBookedDetail = response.ResponseValue;
        },
        error: (error) => {
          console.error('Error fetching travel request json info:', error);
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
        console.log();
      },
      error: (error) => {
        console.error('Error fetching travel payments:', error);
      }
    })
  }

  onTravelModeChange(event: any, field: any) {
    const selectedTravelModeId = event.value.Id || 0;

    if (!selectedTravelModeId) {
      console.warn('No Travel Mode selected, skipping update.');
      return;
    }

    this.dataService.dataGetTravelClass({ TravelModeId: selectedTravelModeId }).pipe(take(1)).subscribe({
      next: (travelClasses) => {
        this.travelClassList = travelClasses.ResponseValue;

        // Update only the relevant control instead of replacing the whole categories array
        this.categories.forEach((category: any) => {
          category.formControls.forEach((control: any) => {
            if (control.name === 'AvailedClass') {
              control.options = this.travelClassList; // Update only options, avoid object replacement
            }
          });
        });
      },
      error: (error) => {
        console.error('Error fetching travel class list:', error);
      }
    });
  }

  mergeData(entries: DataEntry[]): any[] {
    const mergedMap = new Map<number, any>();

    entries.forEach(entry => {
      if (mergedMap.has(entry.parentId)) {
        let existingData = mergedMap.get(entry.parentId);

        if (Array.isArray(existingData.data)) {
          existingData.data.push(entry.data);
        } else {
          existingData.data = [existingData.data, entry.data];
        }
      } else {
        mergedMap.set(entry.parentId, {
          parentId: entry.parentId,
          data: entry.data,
        });
      }
    });

    return Array.from(mergedMap.values());
  }

  getFormData(data: any) {
    this.confirmDialogService
      .confirm({
        title: 'Create Expense Request',
        message: 'Are you sure you want to create Expense request?',
        confirmText: 'Create',
        cancelText: 'Cancel'
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          console.log('Created Expense request.');
        } else {
          console.log('Failed');
        }
      });
    console.log(data)
    const existingCategory = this.expenseRequestData.find((cat: any) => cat.parentId === data.parentId);

    if (existingCategory) {
      existingCategory.data.push(data.data);
      existingCategory.excludedData.push(data.excludedData);
    } else {
      this.expenseRequestData.push({
        parentId: data.parentId,
        data: [data.data],
        excludedData: [data.excludedData]
      });
    }

    console.log(this.expenseRequestData)

    if (data.categoryId == 1) { // Ticket Expense
      const requestBody = {
        UserMasterId: 4,
        TravelTypeId: this.travelRequestPreview.TravelTypeId,
        TravelModeId: data.TravelMode,
        TravelClassId: data.AvailedClass,
        RequestForId: this.travelRequestPreview.RequestForId,
        FromCityId: data.Origin,
        ToCityId: data.Destination,
        ReferenceDate: data.TravelDate,
        TravelRequestGroupType: [
          {
            UserMasterId: 4,
            IsGroupLeader: true
          }
        ]
      }
      this.travelService.travelValidateTravelTicketPolicy(requestBody).pipe(take(1)).subscribe({
        next: (response) => {
          console.log();
        }
      })
    }
    this.prepareExpenseRequestPayload();
    this.snackbarService.success('Operation successful!');
    // this.mainExpenseData.ExpenseRequestDetailType = this.mainExpenseData.ExpenseRequestDetailType ?? [];
    // this.mainExpenseData.ExpenseRequestDetailType.push({
    //   ExpenseRequestDetailId: 0,
    //   ExpenseRequestId: 0,
    //   ExpenseCategoryId: categoryFormData.categoryId,
    //   CityId: 0,
    //   CityGradeId: 0,
    //   CountryId: 0,
    //   CountryGradeId: 0,
    //   ClaimDate: "2025-03-19T08:37:29.629Z",
    //   PaymentModeId: data.PaymentType.KeyDataId || 0,
    //   ClaimAmount: data.Amount || 0,
    //   CurrencyId: data.Currency.Id || 0,
    //   ConversionRate: data.ConversionRate || 0,
    //   ClaimAmountInBaseCurrency: 0,
    //   IsEntitlementActuals: true,
    //   EntitlementAmount: 0,
    //   EntitlementCurrencyId: 0,
    //   EntitlementConversionRate: 0,
    //   ApprovedAmount: 0,
    //   ClaimStatusId: 0,
    //   IsViolation: true,
    //   Violation: "",
    //   IsTravelRaiseRequest: true,
    //   TaxAmount: ""
    // });

    // this.mainExpenseData.ExpenseRequestMetaDataType = [];
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType = this.mainExpenseData.ExpenseRequestDetailMetaDataType ?? [];
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 1,
    //     IntegerValue: data.TravelMode.Id || 0
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 2,
    //     IntegerValue: data.AvailedClass.Id || 0
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 3,
    //     DatetimeValue: data.TravelDate || ''
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 4,
    //     IntegerValue: data.Origin.CityMasterId || 0
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 5,
    //     IntegerValue: data.Destination.CityMasterId || 0
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestDetailMetaDataType?.push(
    //   {
    //     ExpenseRequestMetaId: 9,
    //     VarcharValue: data.Remarks,
    //   }
    // );
    // this.mainExpenseData.ExpenseRequestGstType = this.mainExpenseData.ExpenseRequestGstType ?? [];
    // data?.GSTDetails?.data?.forEach((gstData: any) => {
    //   this.mainExpenseData.ExpenseRequestGstType?.push({
    //     ExpenseRequestGstTypeId: 0,
    //     ExpenseRequestDetailId: 0,
    //     GstIn: gstData.GstIn,
    //     VendorName: "string",
    //     InvoiceNumber: gstData.InvoiceNumber,
    //     Amount: gstData.Amount,
    //     Basic: 0,
    //     CGST: gstData.CGST,
    //     SGST: gstData.SGST,
    //     IGST: gstData.IGST,
    //     UGST: gstData.UGST,
    //     CESS: 0,
    //     Gross: 0,
    //     CostcenterId: this.costcenterId
    //   })
    // })
    // this.mainExpenseData.RelocationExpenseOtherVendorQuoteDetailsType = [];
    // this.mainExpenseData.DocumentType = [];
    // this.createTravelRequest();
  }

  prepareExpenseRequestPayload() {
    this.mainExpenseData.ExpenseRequestId = 0;
    this.mainExpenseData.RequestForId = this.travelRequestPreview.RequestForId;
    this.mainExpenseData.RequesterId = 4;
    this.mainExpenseData.TravelRequestId = this.travelRequestPreview.TravelRequestId;
    this.mainExpenseData.RequestDate = new Date().toISOString();
    this.mainExpenseData.Purpose = this.purpose;
    this.mainExpenseData.CostCentreId = this.costcenterId;
    this.mainExpenseData.BillableCostCentreId = this.mainExpenseData.CostCentreId;
    this.mainExpenseData.Remarks = '';
    this.mainExpenseData.IsDraft = false;
    this.mainExpenseData.ActionBy = 0;
  }

  createTravelRequest() {
    this.expenseService.expenseExpenseRequestCreate(this.mainExpenseData).pipe(take(1)).subscribe({
      next: (response) => {
        console.log();
      }
    })
  }

  getTextData(inputData: any) {
    const requestBody = {
      "SearchText": inputData,
      "TravelTypeId": this.travelRequestPreview.TravelTypeId || 0
    }
    this.dataService.dataGetCityAutocomplete(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {
        // Update only the relevant control instead of replacing the whole categories array
        this.categories.forEach((category: any) => {
          category.formControls.forEach((control: any) => {
            if (control.autoComplete) {
              control.options = response.ResponseValue; // Update only options, avoid object replacement
            }
          });
        });
      }
    })
  }

}