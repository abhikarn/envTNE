
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
import { DatePipe } from '@angular/common';
import { DateExtensionComponent } from '../date-extension/date-extension.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    DynamicFormComponent,
    MatDialogModule
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss',
  providers: [DatePipe]
})
export class MainExpenseComponent {
  @ViewChild('datepickerInput', { static: false }) datepickerInput!: ElementRef;
  travelRequests: any;
  travelRequestBookedDetail: any;
  travelRequestPreview: any;
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
  expenseValidateUserLeaveDateForDuration:any = {};

  constructor(
    private expenseService: ExpenseService,
    private dataService: DataService,
    private travelService: TravelService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private eRef: ElementRef,
    private datePipe: DatePipe,
    private dialog: MatDialog
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

  getTravelRequestPreview() {
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
  }

  onSelectTravelExpenseRequest(event: any) {
    this.travelRequestId = Number(event.target.value) || 0;
    if (this.travelRequestId) {
      this.getTravelRequestPreview();

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
    const existingCategory = this.expenseRequestData.find((cat: any) => cat.formControlId === data.formControlId);

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

    if (data.parentId == 1) { // Ticket Expense
      const requestBody = {
        UserMasterId: 4,
        TravelTypeId: this.travelRequestPreview.TravelTypeId,
        TravelModeId: data.data.TravelMode.Id,
        TravelClassId: data.data.AvailedClass.Id,
        RequestForId: this.travelRequestPreview.RequestForId,
        FromCityId: data.data.Origin.CityMasterId,
        ToCityId: data.data.Destination.CityMasterId,
        ReferenceDate: data.data.TravelDate,
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

  onSelectDate(event: any, field: any) {
    let dateValue = event.value.toISOString() || "";
    this.expenseValidateUserLeaveDateForDuration.UserMasterId = 4;
    this.expenseValidateUserLeaveDateForDuration.TravelRequestId = this.travelRequestId;
    if(field.name == "Check-inDateTime") {
      this.expenseValidateUserLeaveDateForDuration.FromDate = dateValue;
      if(!this.expenseValidateUserLeaveDateForDuration.ToDate) {
        this.expenseValidateUserLeaveDateForDuration.ToDate = dateValue;
      }
    }
    if(field.name == "Check-outDateTime") {
      this.expenseValidateUserLeaveDateForDuration.ToDate = dateValue;
      if(!this.expenseValidateUserLeaveDateForDuration.FromDate) {
        this.expenseValidateUserLeaveDateForDuration.FromDate = dateValue;
      }
    }
    this.expenseService.expenseValidateUserLeaveDateForDuration(this.expenseValidateUserLeaveDateForDuration).pipe(take(1)).subscribe({
      next: (res) => {
        console.log(res.ResponseValue)
      },
      error: (error) => {
        console.error('Error fetching expense Validate User Leave Date For Duration', error);
      }
    });
  }

  onSave(isDraft: boolean) {
    this.mainExpenseData.ExpenseRequestId = 0;
    this.mainExpenseData.RequestForId = this.travelRequestPreview.RequestForId;
    this.mainExpenseData.RequesterId = 4;
    this.mainExpenseData.TravelRequestId = this.travelRequestPreview.TravelRequestId;
    this.mainExpenseData.RequestDate = new Date().toISOString();
    this.mainExpenseData.Purpose = this.purpose;
    this.mainExpenseData.CostCentreId = this.costcenterId;
    this.mainExpenseData.BillableCostCentreId = this.mainExpenseData.CostCentreId;
    this.mainExpenseData.Remarks = '';
    this.mainExpenseData.IsDraft = isDraft;
    this.mainExpenseData.ActionBy = 0;

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
          this.expenseService.expenseExpenseRequestCreate(this.mainExpenseData).pipe(take(1)).subscribe({
            next: (response) => {
              console.log(response);
              this.snackbarService.success('Operation successful!');
            }
          })
        } else {
          console.log('Failed');
        }
      });
  }

  openModal() {
    const dialogRef = this.dialog.open(DateExtensionComponent, {
      maxWidth: '1000px',
      data: {
        TravelDateFrom: this.travelRequestPreview?.TravelDateFromExtended,
        TravelDateTo: this.travelRequestPreview?.TravelDateToExtended,
        remarks: this.travelRequestPreview?.TravelRequestDateExtensionRemarks
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.TravelRequestId = this.travelRequestId;
        this.confirmDialogService
          .confirm({
            title: 'Date Extension',
            message: 'Are you sure you want to change the travel date? This action will affect the per diem claim!',
            confirmText: 'Yes Update',
            cancelText: 'No'
          })
          .subscribe((confirmed) => {
            if (confirmed) {
              this.travelService.travelTravelRequestDateExtension(result).pipe(take(1)).subscribe({
                next: (response) => {
                  this.getTravelRequestPreview();
                  this.snackbarService.success('Record Updated Successfully.');
                }
              })
            } else {
              this.snackbarService.success('Failed To Update Record');
            }
          });

      }
    });
  }
  
}