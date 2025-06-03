import { Component, DestroyRef, ElementRef, HostListener, inject, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { FormControlFactory } from '../../../shared/dynamic-form/form-control.factory';
import { ServiceRegistryService } from '../../../shared/service/service-registry.service';
import { SummaryComponent } from '../../../shared/component/summary/summary.component';
import { UtilsService } from '../../../shared/service/utils.service';
import { ApplicationMessageService } from '../../../shared/service/application-message.service';
import { environment } from '../../../../environment';
import { BottomSheetService } from '../../../shared/service/bottom-sheet.service';


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
    MatDialogModule,
    SummaryComponent
  ],
  templateUrl: './main-expense.component.html',
  styleUrl: './main-expense.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})

export class MainExpenseComponent {
  assetPath = `${environment.assetsPath}`
  @ViewChild(SummaryComponent) summaryComponent: any;
  @ViewChild('datepickerInput', { static: false }) datepickerInput!: ElementRef;
  travelRequests: any;
  travelRequestPreview: any;
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
  responseData: any;
  justificationForm: any = new FormGroup({
    justification: new FormControl('', Validators.required)
  });
  expenseSummary: any;
  expenseConfig: any;
  expenseRequestForm: FormGroup = new FormGroup({});
  formControls: any = [];
  expenseRequestId: any = 0;
  userMasterId: number = 0;
  editMode = false;
  expenseRequestPreviewData: any;
  travelDetails: any;
  transactionId: any;
  expenseConfirmMessage: any;

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
    private serviceRegistry: ServiceRegistryService,
    private router: Router,
    private utilsService: UtilsService,
    private applicationMessageService: ApplicationMessageService,
    private bottomSheetService: BottomSheetService
  ) {
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const element = this.eRef.nativeElement.querySelector('#expenseCategories');

    if (!this.dialogOpen && element && element.contains(event.target) && this.travelRequestId == 0) {
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
    this.expenseConfig.request.requestBody.userMasterId = this.userMasterId;
    const payload = this.expenseConfig.request.requestBody;
    if (service && typeof service[apiMethod] === 'function') {
      service[apiMethod](payload).subscribe((data: any) => {
        const labelKey = this.expenseConfig.request.labelKey || 'label';
        const valueKey = this.expenseConfig.request.valueKey || 'value';
        this.travelRequests = data.ResponseValue?.map((item: any) => ({
          label: item[labelKey],
          value: item[valueKey]
        }));
      });
    }
  }

  ngOnInit() {
    this.initializeBasicFields();
    this.loadInitialData();
  }

  // Set up basic fields like userMasterId, expenseRequestId, and editMode flag.
  initializeBasicFields() {
    this.userMasterId = Number(localStorage.getItem('userMasterId'));
    this.transactionId = this.route.snapshot.paramMap.get('id') || 0;
    if (this.transactionId) {
      this.editMode = true;
    }
    this.expenseRequestData = [];
  }

  // Load master data (baggage types, meals, travel modes) and expense config file.
  loadInitialData() {
    forkJoin({
      baggageTypeList: this.dataService.dataGetBaggageType(),
      boMealsList: this.dataService.dataGetMealType(),
      localTravelTypeList: this.dataService.dataGetLocalTravelType(),
      localTravelModeList: this.dataService.dataGetLocalTravelMode(),
      expenseConfig: this.http.get<any>(`${this.assetPath}/assets/config/expense-config.json`)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (responses) => this.handleInitialResponses(responses),
        error: (err) => console.error(err)
      });
  }

  // Handle forkJoin API responses and initialize form structures and categories.
  handleInitialResponses(responses: any) {
    this.baggageTypeList = responses.baggageTypeList.ResponseValue;
    this.localTravelTypeList = responses.localTravelTypeList.ResponseValue;
    this.localTravelModeList = responses.localTravelModeList.ResponseValue;
    this.boMealsList = responses.boMealsList.ResponseValue;
    this.expenseConfig = responses.expenseConfig.expenseRequest;

    this.setupExpenseConfig();
    this.setupCategories();
    this.setupJustificationForm();

    if (this.transactionId) {
      this.loadExistingExpenseRequest();
    }
  }

  // Setup initial dynamic form control based on expenseConfig request object.
  setupExpenseConfig() {
    if (this.expenseConfig?.request) {
      this.getTravelRequestList();
      const control = FormControlFactory.createControl(this.expenseConfig.request);
      this.formControls.push({ formConfig: this.expenseConfig.request, control: control });
      this.expenseRequestForm.addControl(this.expenseConfig.request.name, control);
      this.formControls = [];
    }
    if (this.expenseConfig?.travelDetails) {
      this.travelDetails = this.expenseConfig?.travelDetails;
    }
  }

  // Setup form categories with dynamic options mapping from master data.
  setupCategories() {
    const optionMapping: { [key: string]: any[] } = {
      BaggageType: this.baggageTypeList,
      BoMeals: this.boMealsList,
      LocalTravelType: this.localTravelTypeList,
      LocalTravelMode: this.localTravelModeList
    };

    this.categories = this.expenseConfig.category.map((category: any) => ({
      ...category,
      formControls: category.formControls.map((control: any) => ({
        ...control,
        options: optionMapping[control.name] || control.options
      }))
    }));

    this.expenseSummary = this.expenseConfig.summaries;
  }

  // Setup validation rules for justification text field if required.
  setupJustificationForm() {
    const justificationCfg = this.expenseConfig.justification;
    if (justificationCfg?.required) {
      this.justificationForm.controls[justificationCfg.controlName].setValidators([
        Validators.required,
        Validators.maxLength(justificationCfg.maxLength || 2000)
      ]);
    }
  }

  // Load an existing saved expense request if editing mode is active.
  loadExistingExpenseRequest() {
    const requestBody = {
      status: "Active",
      transactionId: this.transactionId
    };

    this.newExpenseService.getExpenseRequest(requestBody)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response) {
            this.expenseRequestId = response.expenseRequestId;
            this.expenseRequestPreviewData = response;
            // this.travelDetails?.data?.forEach((config: any) => {
            //   const prop = config.name;
            //   if (this.expenseRequestPreviewData && this.expenseRequestPreviewData.hasOwnProperty(prop)) {
            //     config.value = this.expenseRequestPreviewData[prop];
            //   }
            // });
            // this.travelDetails?.data?.sort((a: any, b: any) => a.order - b.order);
            this.populateExistingExpenseData(response);
          }
        }
      });
  }

  // Populate existing expense request data into form structure for editing.
  populateExistingExpenseData(response: any) {
    this.travelRequestId = response.travelRequestId;
    this.justificationForm.get(this.expenseConfig.justification.controlName).setValue(response?.remarks);
    this.getTravelRequestPreview();

    const categoryMap = new Map(this.categories.map((cat: any) => [cat.name, cat]));

    response?.dynamicExpenseDetailModels?.forEach((dataItem: any) => {
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

    this.responseData = JSON.parse(JSON.stringify(response));
    this.updateCategoryCounts();
    this.expenseRequestData = response;
    this.setCurrencyDropdown();

    setTimeout(() => {
      this.summaryComponent.calculatTotalExpenseAmount();
      this.summaryComponent.calculatCategoryWiseExpense();
    }, 1000);

    this.applyExcludedFields();
    this.onTabChange(0);
  }

  // Update category item counts based on populated existing data.
  updateCategoryCounts() {
    this.categories?.forEach((cat: any) => {
      const matchedData = this.responseData?.dynamicExpenseDetailModels?.find((data: any) => data.name == cat.name);
      cat.count = matchedData ? matchedData.data.length : 0;
    });
  }

  // Apply field exclusion rules for each category when editing existing entries.
  applyExcludedFields() {
    const categoryMap = new Map(this.categories.map((cat: any) => [cat.name, cat]));

    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((requestData: any) => {
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

          if (Object.keys(formattedData.excludedData).length === 0) {
            delete formattedData.excludedData;
          }

          return formattedData;
        });
      }
    });
  }

  // Update existingExpenseRequestData based on the selected tab index or tab change event.
  onTabChange(eventOrIndex?: MatTabChangeEvent | number) {
    if (!this.categories?.length) return;

    const tabIndex = typeof eventOrIndex === 'number'
      ? eventOrIndex
      : eventOrIndex?.index ?? 0;

    const tabLabel = this.categories[tabIndex]?.name;
    this.existingExpenseRequestData = this.responseData?.dynamicExpenseDetailModels
      ?.find((t: any) => t.name === tabLabel)?.data || [];
  }

  // Set default currency for 'Currency' fields based on travel type.
  setCurrencyDropdown() {
    const isWithoutCurrency = ['52', '54'].includes(this.travelRequestPreview?.TravelTypeId) || [52, 54].includes(this.expenseRequestData?.claimTypeId);

    const defaultCurrency = {
      Id: 1,
      Code: "INR",
      Name: "Indian Rupee",
      Alias: "Indian Rupee",
      IsBaseCurrency: true,
      Display: "Indian Rupee : INR"
    };

    this.categories?.forEach((category: any) =>
      category.formControls?.forEach((control: any) => {
        if (control?.name === 'Currency') {
          control.defaultValue = isWithoutCurrency ? null : defaultCurrency;
        }
      })
    );
  }


  // Fetch travel request preview and extract user, cost center, and purpose info.
  getTravelRequestPreview() {
    if (!this.travelRequestId) return;
    this.travelService
      .travelGetTravelRequestPreview({ TravelRequestId: this.travelRequestId })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const preview = response.ResponseValue;
          this.travelRequestPreview = { ...preview, UserMasterId: this.userMasterId };

          this.travelDetails?.data?.forEach((config: any) => {
            const prop = config.name;
            if (this.travelRequestPreview && this.travelRequestPreview.hasOwnProperty(prop)) {
              config.value = this.travelRequestPreview[prop];
            }
            if (this.travelRequestPreview?.TravelRequestMetaData) {
              this.travelRequestPreview.TravelRequestMetaData.forEach((meta: any) => {
                if (meta && meta.FieldName === prop) {
                  config.value = meta.IntegerValueReference;
                }
              });
            }
          });
          this.travelDetails?.data?.sort((a: any, b: any) => a.order - b.order);

          const meta = this.travelRequestPreview.TravelRequestMetaData || [];
          this.costcenterId = meta.find((d: any) => d.TravelRequestMetaId === 4)?.IntegerValue;
          this.purpose = meta.find((d: any) => d.TravelRequestMetaId === 1)?.IntegerValueReference;

          this.setCurrencyDropdown();
        },
        error: (error) => {
          console.error('Error fetching travel request preview:', error);
        }
      });
  }


  // Update travelRequestId based on user selection and fetch travel request preview.
  onSelectTravelExpenseRequest(event: Event) {
    const target = event?.target as HTMLSelectElement;
    this.travelRequestId = Number(target?.value) || 0;

    if (this.travelRequestId) {
      this.initializeBasicFields();
      this.loadInitialData();
      this.getTravelRequestPreview();
    }
  }


  // Add or update form data in the expense request based on ReferenceId or editIndex.
  getFormData(formData: any) {
    console.log("Form: ", formData);
    const { formData: data, editIndex } = formData;

    const existingCategory = this.expenseRequestData?.dynamicExpenseDetailModels
      ?.find((cat: any) => cat.name === data.name);

    if (existingCategory) {
      const incomingData = data.data;
      const existingEntryIndex = incomingData.ReferenceId
        ? existingCategory.data?.findIndex((entry: any) => entry.ReferenceId === incomingData.ReferenceId)
        : editIndex;

      if (existingEntryIndex !== -1) {
        // Update existing entry
        existingCategory.data[existingEntryIndex] = incomingData;
      } else {
        // Add new entry
        existingCategory.data.push(incomingData);
      }

    } else {
      // Create new category with the incoming data
      this.expenseRequestData.dynamicExpenseDetailModels ??= [];
      this.expenseRequestData.dynamicExpenseDetailModels.push({
        name: data.name,
        data: [data.data]
      });
    }
    this.summaryComponent.calculatTotalExpenseAmount();
    this.summaryComponent.calculatCategoryWiseExpense();
  }

  updateCategoryData(updated: { name: string, data: any[] }) {
    const categoryBlock = this.expenseRequestData?.dynamicExpenseDetailModels?.find((x: any) => x.name === updated.name);
    if (categoryBlock) {
      categoryBlock.data = updated.data;
    }

    const tab = this.categories.find((c: any) => c.name === updated.name);
    if (tab) tab.count = updated.data.length;

    this.summaryComponent.calculatTotalExpenseAmount();
    this.summaryComponent.calculatCategoryWiseExpense();
  }

  // Populate autoComplete options by input value (ID or search text) and update matching control.
  getTextData(inputData: any) {
    const { inputValue, control } = inputData;

    if (typeof inputValue === 'number') {
      const requestBody = [{ id: inputValue, name: '', masterName: 'City' }];

      this.newExpenseService.getMasterNameById(requestBody).pipe(take(1)).subscribe({
        next: (response: any[]) => {
          const formatted = response?.map(item => ({ CityMasterId: item.id, City: item.name })) || [];
          this.updateMatchingControls(inputValue, formatted, control);
        }
      });
    }

    if (typeof inputValue === 'string') {
      const requestBody = {
        SearchText: inputValue,
        TravelTypeId: this.travelRequestPreview?.TravelTypeId || 0
      };

      this.dataService.dataGetCityAutocomplete(requestBody).pipe(take(1)).subscribe({
        next: (response: any) => {
          this.categories.forEach((category: any) => {
            category.formControls.forEach((control: any) => {
              if (control.autoComplete) {
                const labelKey = control.labelKey || 'label';
                const valueKey = control.valueKey || 'value';
                control.options = response.ResponseValue?.map((item: any) => ({
                  label: item[labelKey],
                  value: item[valueKey]
                })) || [];
              }
            });
          });
        }
      });
    }
  }

  private updateMatchingControls(inputValue: number, data: any[], controlRef: any) {
    this.categories.forEach((category: any) => {
      category.formControls.forEach((control: any) => {
        if (control.autoComplete && control.value === inputValue) {
          const labelKey = control.labelKey || 'label';
          const valueKey = control.valueKey || 'value';
          control.options = data
            .filter(item => item[valueKey] === inputValue)
            .map(item => ({
              label: item[labelKey],
              value: item[valueKey]
            }));

          controlRef.setValue(control.options[0]);
        }
      });
    });
  }

  // Set and validate FromDate and ToDate based on selected Check-in or Check-out date.
  onSelectDate(event: any, field: any) {
    const dateValue = event.value?.toISOString() || '';

    this.expenseValidateUserLeaveDateForDuration.UserMasterId = 4;
    this.expenseValidateUserLeaveDateForDuration.TravelRequestId = this.travelRequestId;

    if (field.name === 'Check-inDateTime') {
      this.expenseValidateUserLeaveDateForDuration.FromDate = dateValue;
      this.expenseValidateUserLeaveDateForDuration.ToDate ||= dateValue;
    }

    if (field.name === 'Check-outDateTime') {
      this.expenseValidateUserLeaveDateForDuration.ToDate = dateValue;
      this.expenseValidateUserLeaveDateForDuration.FromDate ||= dateValue;
    }

    this.expenseService
      .expenseValidateUserLeaveDateForDuration(this.expenseValidateUserLeaveDateForDuration)
      .pipe(take(1))
      .subscribe({
        next: (res) => console.log(res.ResponseValue),
        error: (error) => console.error('Error fetching expense Validate User Leave Date For Duration', error)
      });
  }


  // Handle submit, draft, or navigation actions after validating forms.
  onAction(type: string) {

    if (type == "cancel") {
      if (this.editMode) {
        this.router.navigate(['../expense/expense/dashboard']);
        return;
      } else {
        this.router.navigate(['../expense/expense/landing']);
        return;
      }
    }

    // if (type === 'submit' || type === 'draft') {
    //   this.mainExpenseData.IsDraft = type === 'draft';
    //   this.expenseConfirmMessage= this.applicationMessageService.getApplicationMessage({Flag: 'ExpenseSubmitConfirm'})
    //   this.createExpenseRequest();
    // } else {
    //   this.router.navigate(['expense/expense/landing']);
    // }
    if (type === 'submit' || type === 'draft') {
      this.mainExpenseData.IsDraft = type === 'draft';

      this.applicationMessageService.getApplicationMessage({ Flag: 'ExpenseSubmitConfirm' })
        .subscribe((data: any) => {
          this.expenseConfirmMessage = data?.ResponseValue?.Message;
          this.createExpenseRequest();
        });
    } else {
      this.router.navigate(['expense/expense/landing']);
    }
  }

  // Prepare and submit the main expense request after confirmation.
  createExpenseRequest() {

    if (!this.travelRequestId || !this.expenseRequestData?.dynamicExpenseDetailModels) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return;
    }

    if (this.expenseRequestForm.invalid) {
      this.expenseRequestForm.markAllAsTouched();
      return;
    }

    if (this.justificationForm.invalid) {
      this.justificationForm.markAllAsTouched();
      return;
    }

    this.mainExpenseData = {
      ...this.mainExpenseData,
      ExpenseRequestId: this.expenseRequestId,
      RequestForId: this.travelRequestPreview.RequestForId,
      RequesterId: this.userMasterId,
      TravelRequestId: this.travelRequestPreview.TravelRequestId,
      RequestDate: new Date().toISOString(),
      Purpose: this.purpose,
      CostCentreId: this.costcenterId,
      BillableCostCentreId: this.costcenterId,
      Remarks: this.justificationForm.get(this.expenseConfig.justification.controlName)?.value,
      ActionBy: this.userMasterId,
      dynamicExpenseDetailModels: this.utilsService.simplifyObject(this.expenseRequestData?.dynamicExpenseDetailModels)
    };
    console.log(this.mainExpenseData);


    this.confirmDialogService
      .confirm({
        title: 'Create Expense Request',
        message: this.expenseConfirmMessage,
        confirmText: 'Create',
        cancelText: 'Cancel'
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.newExpenseService.expenseRequestCreatePost(this.mainExpenseData)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.snackbarService.success(response.ResponseValue[0].ErrorMessage + ' ' + response.ResponseValue[0].Reference);
                this.router.navigate(['/expense/expense/dashboard']);
              },
              error: (err) => {
                console.error(err);
                this.snackbarService.error('Something went wrong with the API.');
              }
            });
        } else {
          console.log('Expense request creation cancelled.');
        }
      });
  }


  openModal() {
    const data = {
      TravelDateFrom: this.travelRequestPreview?.TravelDateFromExtended,
      TravelDateTo: this.travelRequestPreview?.TravelDateToExtended,
      remarks: this.travelRequestPreview?.TravelRequestDateExtensionRemarks
    };

    if (window.innerWidth <= 768) { // Use bottom sheet for mobile
      this.bottomSheetService.openBottomSheet(DateExtensionComponent, data).subscribe(result => {
        this.handleResult(result);
      });
    } else { // Use dialog for larger screens
      const dialogRef = this.dialog.open(DateExtensionComponent, {
        maxWidth: '1000px',
        data
      });

      dialogRef.afterClosed().subscribe(result => {
        this.handleResult(result);
      });
    }
  }

  private handleResult(result: any) {
    if (!result) return;

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
          this.travelService.travelTravelRequestDateExtension(result)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.getTravelRequestPreview();
                this.snackbarService.success('Record Updated Successfully.');
              }
            });
        } else {
          this.snackbarService.success('Failed To Update Record');
        }
      });
  }
}


