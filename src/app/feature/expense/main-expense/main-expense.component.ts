
import { Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DataService, ExpenseRequestModel, ExpenseService, TravelService } from '../../../../../tne-api';
import { forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFormControl } from '../../../shared/dynamic-form/form-control.interface';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackbarService } from '../../../shared/service/snackbar.service';
import { ConfirmDialogService } from '../../../shared/service/confirm-dialog.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DateExtensionComponent } from '../date-extension/date-extension.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewExpenseService } from '../service/new-expense.service';
import { ActivatedRoute } from '@angular/router';
import { FormControlFactory } from '../../../shared/dynamic-form/form-control.factory';
import { ServiceRegistryService } from '../../../shared/service/service-registry.service';

interface DataEntry {
  name: number;
  data: any;
}

@Component({
  selector: 'app-main-expense',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  expenseRequestPreview: any;
  travelClassList: any;
  originControl = new FormControl('');
  cities = [];
  // filteredCities$: Observable<{ CityMasterId: number; City: string }[]>;
  travelPaymentList: any;
  accomodationTypeList: any;
  baggageTypeList: any;
  otherTypeList: any;
  boMealsList: any;
  localTravelTypeList: any;
  localTravelModeList: any;
  private destroyRef = inject(DestroyRef);
  categories: any = [];
  mainExpenseData: any = {};
  costcenterId: any;
  purpose: any;
  expenseRequestData: any = [];
  travelRequestId: number = 0;
  dialogOpen = false;
  expenseValidateUserLeaveDateForDuration: any = {};
  expenseRequestConfigData: any = [];
  existingExpenseRequestData = [];
  cid: string | null = null;
  responseData: any;
  justificationForm: any = new FormGroup({
    justification: new FormControl('', Validators.required)
  });
  summaries: any;
  data: any = {
    totalExpense: 6000,
    lessAdvance: 20000,
    amountPaidByCompany: 0,
    corporateCreditCard: 0,
    cash: 0,
    amountPayable: 26000,
    localConveyance: 600,
    foodAllowance: 800,
    accommodation: 5000,
    boardingAllowance: 750,
    others: 0,
    totalCategory: 7210
  };
  expenseConfig: any;
  expenseRequestForm: FormGroup = new FormGroup({});
  formControls: any = [];

  constructor(
    private expenseService: ExpenseService,
    private dataService: DataService,
    private travelService: TravelService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private eRef: ElementRef,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private newExpenseService: NewExpenseService,
    private route: ActivatedRoute,
    private serviceRegistry: ServiceRegistryService
  ) {

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const dropdown = this.eRef.nativeElement.querySelector('#ddlTravelExpenseRequest');

    if (!this.dialogOpen && dropdown && !dropdown.contains(event.target) && this.travelRequestId == 0) {
      this.dialogOpen = true;
      this.confirmDialogService
        .confirm(this.expenseConfig.request.confirmPopup)
        .subscribe(() => {
          this.dialogOpen = false;
        });
    }
  }

  getTravelRequestList() {
    const service = this.serviceRegistry.getService(this.expenseConfig.request.apiService);
    const apiMethod = this.expenseConfig.request.apiMethod;
    const payload = this.expenseConfig.request.requestBody;
    if (service && typeof service[apiMethod] === 'function') {
      service[apiMethod](payload).subscribe((data: any) => {
        const labelKey = this.expenseConfig.request.labelKey || 'label';
        const valueKey = this.expenseConfig.request.valueKey || 'value';
        this.travelRequests = data.ResponseValue.map((item: any) => ({
          label: item[labelKey],
          value: item[valueKey]
        }));
      });
    }
  }

  ngOnInit() {
    // Get 'cid' from query params
    this.route.queryParamMap.subscribe(params => {
      this.cid = params.get('cid');
    });


    forkJoin({
      baggageTypeList: this.dataService.dataGetBaggageType(),
      // otherTypeList: this.expenseService.getOtherTypeList(),
      boMealsList: this.dataService.dataGetMealType(),
      localTravelTypeList: this.dataService.dataGetLocalTravelType(),
      localTravelModeList: this.dataService.dataGetLocalTravelMode(),
      expenseConfig: this.http.get<any>('/assets/config/expense-config.json')
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (responses) => {
        // Handle all the API responses here
        this.baggageTypeList = responses.baggageTypeList.ResponseValue;
        this.localTravelTypeList = responses.localTravelTypeList.ResponseValue;
        this.localTravelModeList = responses.localTravelModeList.ResponseValue;
        this.boMealsList = responses.boMealsList.ResponseValue;
        this.expenseConfig = responses.expenseConfig;
        if (this.expenseConfig?.request) {
          this.getTravelRequestList();
          const control = FormControlFactory.createControl(this.expenseConfig.request);
          this.formControls.push({ formConfig: this.expenseConfig.request, control: control });
          this.expenseRequestForm.addControl(this.expenseConfig.request.name, control);
        }

        console.log(this.expenseRequestForm)

        const optionMapping: { [key: string]: any[] } = {
          BaggageType: this.baggageTypeList,
          // OtherType: responses.otherTypeList.ResponseValue,
          BoMeals: this.boMealsList,
          LocalTravelType: this.localTravelTypeList,
          LocalTravelMode: this.localTravelModeList
        };
        this.categories = this.expenseConfig.category.map((category: any) => ({
          ...category,
          formControls: category.formControls.map((control: any) => ({
            ...control,
            options: optionMapping[control.name] || control.options,
            // option$: typeof control.option$ === 'string' && control.option$ === 'filteredCities$'
            //   ? this.filteredCities$.pipe(map(cities => cities.map(c => ({ value: c.City }))))
            //   : undefined
          }))
        }));

        this.summaries = this.expenseConfig.summaries;

        const justificationCfg = this.expenseConfig.justification;
        if (justificationCfg?.required) {
          this.justificationForm.controls[justificationCfg.controlName].setValidators([
            Validators.required,
            Validators.maxLength(justificationCfg.maxLength || 2000)
          ]);
        }

        if (this.cid) {
          this.travelRequestId = Number(this.cid);
          this.onSelectTravelExpenseRequest(null);
          let requestBody = {
            status: "Active",
            expenseRequestId: this.cid
          }
          this.newExpenseService.getExpenseRequest(requestBody).pipe(take(1)).subscribe({
            next: (response) => {
              if (response) {
                // Create a map for quick lookup by category name
                const categoryMap = new Map(this.categories.map((cat: any) => [cat.name, cat]));

                // Step 1: Filter data properties based on formControls
                response.forEach((dataItem: any) => {
                  const category: any = categoryMap.get(dataItem.name);
                  if (category) {
                    const validControlNames = category.formControls.map((c: any) => c.name);
                    validControlNames.push('ReferenceId');

                    dataItem.data = dataItem.data.map((entry: any) => {
                      const filteredEntry: any = {};
                      validControlNames.forEach((key: any) => {
                        if (key in entry) {
                          filteredEntry[key] = entry[key];
                        }
                      });
                      return filteredEntry;
                    });
                  }
                });

                // Deep clone to avoid mutation in step 2
                this.responseData = JSON.parse(JSON.stringify(response));
                this.onTabChange(0);
                this.expenseRequestData = response;

                // Step 2: Format the data and apply exclusion logic
                this.expenseRequestData.forEach((requestData: any) => {
                  const category: any = categoryMap.get(requestData.name);
                  if (category) {
                    requestData.data = requestData.data.map((entry: any) => {
                      const formattedData: any = {
                        ReferenceId: entry.ReferenceId,
                        excludedData: {}
                      };

                      category.formControls.forEach((control: any) => {
                        const fieldName = control.name;
                        const fieldValue = entry[fieldName];
                        control.value = fieldValue;

                        if (control.isExcluded) {
                          formattedData.excludedData[fieldName] = fieldValue ?? null;
                        } else {
                          formattedData[fieldName] = fieldValue ?? null;
                        }
                      });

                      // Clean up excludedData if empty
                      if (Object.keys(formattedData.excludedData).length === 0) {
                        delete formattedData.excludedData;
                      }
                      return formattedData;
                    });
                  }
                });
              }
            }
          })
        }
      },
      error: (err) => {
        // Handle any errors
        console.error(err);
      }
    });
  }

  onTabChange(eventOrIndex?: MatTabChangeEvent | number) {
    let tabIndex: number;
    if (typeof eventOrIndex === 'number') {
      tabIndex = eventOrIndex;
    } else if (eventOrIndex?.index !== undefined) {
      tabIndex = eventOrIndex.index;
    } else {
      tabIndex = 0; // default
    }
    const tabLabel = this.categories[tabIndex].name;
    if (this.responseData) {
      const tab = this.responseData.find((t: any) => t.name == tabLabel);
      this.existingExpenseRequestData = tab ? tab.data : [];
    }
  }

  getTravelRequestPreview() {
    this.expenseService.expenseExpenseRequestPreview({ ExpenseRequestId: this.travelRequestId }).pipe(take(1)).subscribe({
      next: (response) => {
        this.expenseRequestPreview = response.ResponseValue;
        this.costcenterId = this.expenseRequestPreview.ExpenseRequestMetaData.find((data: any) => data.ExpenseRequestMetaId === 4)?.IntegerValue;
        this.purpose = this.expenseRequestPreview.ExpenseRequestMetaData.find((data: any) => data.ExpenseRequestMetaId === 1)?.IntegerValueReference;

      },
      error: (error) => {
        console.error('Error fetching travel request preview:', error);
      }
    })
  }

  onSelectTravelExpenseRequest(event: any) {
    if (!this.travelRequestId) {
      this.travelRequestId = Number(event.target.value) || 0;
    }

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

  mergeData(entries: DataEntry[]): any[] {
    const mergedMap = new Map<number, any>();

    entries.forEach(entry => {
      if (mergedMap.has(entry.name)) {
        let existingData = mergedMap.get(entry.name);

        if (Array.isArray(existingData.data)) {
          existingData.data.push(entry.data);
        } else {
          existingData.data = [existingData.data, entry.data];
        }
      } else {
        mergedMap.set(entry.name, {
          name: entry.name,
          data: entry.data,
        });
      }
    });

    return Array.from(mergedMap.values());
  }

  getFormData(data: any) {
    const existingCategory = this.expenseRequestData.find((cat: any) => cat.name === data.name);

    if (existingCategory) {
      const incomingData = data.data;
      const existingEntryIndex = existingCategory.data?.findIndex((entry: any) => entry.ReferenceId === incomingData.ReferenceId);

      if (existingEntryIndex !== -1) {
        // Update existing entry
        existingCategory.data[existingEntryIndex] = incomingData;
      } else {
        // Add new entry
        existingCategory.data.push(incomingData);
      }
    } else {
      // Create new category with the incoming data
      this.expenseRequestData.push({
        name: data.name,
        data: [data.data]
      });
    }
  }

  getTextData(inputData: any) {
    // Discuss with Muttappa for new API requirement
    if (typeof inputData.inputValue == 'number') {
      let response = [
        { CityMasterId: 2, City: "Bangalore [ BLR ]" },
        { CityMasterId: 40, City: "Chennai [ MAA ]" }
      ];

      this.categories.forEach((category: any) => {
        category.formControls.forEach((control: any) => {
          if (control.autoComplete && control.value == inputData.inputValue) {
            control.options = response.filter(r => r.CityMasterId == inputData.inputValue);
            const labelKey = control.labelKey || 'label';
            const valueKey = control.valueKey || 'value';
            control.options = control.options?.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
            inputData.control.setValue(control.options[0])
          }
        });
      });
    } else {
      const requestBody = {
        "SearchText": inputData.inputValue,
        "TravelTypeId": this.expenseRequestPreview.TravelRequestId || 0
      }
      this.dataService.dataGetCityAutocomplete(requestBody).pipe(take(1)).subscribe({
        next: (response: any) => {
          // Update only the relevant control instead of replacing the whole categories array
          this.categories.forEach((category: any) => {
            category.formControls.forEach((control: any) => {
              if (control.autoComplete) {
                const labelKey = control.labelKey || 'label';
                const valueKey = control.valueKey || 'value';
                control.options = response.ResponseValue?.map((item: any) => ({
                  label: item[labelKey],
                  value: item[valueKey]
                }));
              }
            });
          });
        }
      })
    }

  }

  onSelectDate(event: any, field: any) {
    let dateValue = event.value.toISOString() || "";
    this.expenseValidateUserLeaveDateForDuration.UserMasterId = 4;
    this.expenseValidateUserLeaveDateForDuration.TravelRequestId = this.travelRequestId;
    if (field.name == "Check-inDateTime") {
      this.expenseValidateUserLeaveDateForDuration.FromDate = dateValue;
      if (!this.expenseValidateUserLeaveDateForDuration.ToDate) {
        this.expenseValidateUserLeaveDateForDuration.ToDate = dateValue;
      }
    }
    if (field.name == "Check-outDateTime") {
      this.expenseValidateUserLeaveDateForDuration.ToDate = dateValue;
      if (!this.expenseValidateUserLeaveDateForDuration.FromDate) {
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
    this.mainExpenseData.RequestForId = this.expenseRequestPreview.RequestForId;
    this.mainExpenseData.RequesterId = 4;
    this.mainExpenseData.TravelRequestId = this.expenseRequestPreview.TravelRequestId;
    this.mainExpenseData.RequestDate = new Date().toISOString();
    this.mainExpenseData.Purpose = this.purpose;
    this.mainExpenseData.CostCentreId = this.costcenterId;
    this.mainExpenseData.BillableCostCentreId = this.mainExpenseData.CostCentreId;
    this.mainExpenseData.Remarks = '';
    this.mainExpenseData.IsDraft = isDraft;
    this.mainExpenseData.ActionBy = 0;
    this.mainExpenseData.expenseRequestData = this.expenseRequestData;

    this.confirmDialogService
      .confirm({
        title: 'Create Expense Request',
        message: 'Are you sure you want to create Expense request?',
        confirmText: 'Create',
        cancelText: 'Cancel'
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          let payload = this.simplifyObject(this.expenseRequestData);

          this.newExpenseService.expenseRequestCreatePost(payload).pipe(take(1)).subscribe({
            next: (response) => {
              this.snackbarService.success(response.ResponseValue[0].ErrorMessage + ' ' + response.ResponseValue[0].Reference);
            },
            error: (err) => {
              console.error(err);
              this.snackbarService.error('Something went wrong with the API.');
            }
          });
          // this.expenseService.expenseExpenseRequestCreate(this.mainExpenseData).pipe(take(1)).subscribe({
          //   next: (response) => {
          //     console.log(response);
          //     this.snackbarService.success('Operation successful!');
          //   }
          // })
        } else {
          console.log('Failed');
        }
      });
  }

  openModal() {
    const dialogRef = this.dialog.open(DateExtensionComponent, {
      maxWidth: '1000px',
      data: {
        TravelDateFrom: this.expenseRequestPreview?.TravelDateFromExtended,
        TravelDateTo: this.expenseRequestPreview?.TravelDateToExtended,
        remarks: this.expenseRequestPreview?.TravelDateExtensionRemarks
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

  simplifyObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.simplifyObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];

          // Check for { label: ..., value: ... } structure
          if (
            value &&
            typeof value === 'object' &&
            'value' in value &&
            Object.keys(value).length === 2 &&
            'label' in value
          ) {
            newObj[key] = value.value;
          }
          // Check if the value is a date string and format it
          else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            newObj[key] = value.split('T')[0]; // Keep only the date part
          }
          else {
            newObj[key] = this.simplifyObject(value);
          }
        }
      }
      return newObj;
    }
    return obj;
  }


  onAction(type: string) {
    console.log(type)
  }

  toggleAccordion(activeId: string): void {
    this.summaries = this.summaries.map((summary: any) => ({
      ...summary,
      isOpen: summary.id === activeId
    }));
  }
}


