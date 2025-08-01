import { Component, DestroyRef, ElementRef, HostListener, inject, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DataService, ExpenseRequestModel, ExpenseService, FinanceService, TravelService } from '../../../../../tne-api';
import { debounceTime, forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatBottomSheet } from '@angular/material/bottom-sheet';


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
    SummaryComponent,
    MatSelectModule
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
  @ViewChild('requestBottomSheet') requestBottomSheet!: TemplateRef<any>;
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
  isMobile = false;
  selectedExtraCategory: any = null;
  filteredOptions: any = [];
  billableControl: FormControl = new FormControl('');
  selectedTabIndex: number = 0;
  moduleConfig: any = {};
  expenseClaimTypeDescription: any;
  expenseLandingBoxForm: FormGroup = new FormGroup({});
  boxModuleData: any;
  title: string = '';
  otherExpenseResponse: any;

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
    private bottomSheetService: BottomSheetService,
    private bottomSheet: MatBottomSheet
  ) {
    this.isMobile = window.innerWidth <= 768;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const element = this.eRef.nativeElement.querySelector('#expenseCategories');

    if (!this.dialogOpen && element && element.contains(event.target) && this.travelRequestId == 0 && this.expenseConfig.request?.displayPage[this.moduleConfig.pageTitle]) {
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

  initBillanleControl() {
    this.billableControl.setValidators([Validators.required]);
    this.billableControl.updateValueAndValidity();
    this.billableControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(searchText =>
          this.dataService.dataGetCostCentreAutocomplete({ SearchText: searchText || '' })
        )
      )
      .subscribe({
        next: (res) => {
          this.filteredOptions = res?.ResponseValue || [];
        },
        error: (err) => {
          console.error('Failed to fetch cost centres', err);
          this.filteredOptions = [];
        }
      });
  }

  // Set up basic fields like userMasterId, expenseRequestId, and editMode flag.
  initializeBasicFields() {
    this.userMasterId = Number(localStorage.getItem('userMasterId'));
    this.transactionId = this.route.snapshot.paramMap.get('id') || 0;
    this.expenseClaimTypeDescription = this.route.snapshot.paramMap.get('ExpenseClaimTypeDescription') || '';
    if (this.transactionId) {
      this.editMode = true;
    }
    this.expenseRequestData = [];
    this.billableControl.setValue(null);
  }

  // Load master data (baggage types, meals, travel modes) and expense config file.
  loadInitialData() {
    forkJoin({
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
    this.expenseConfig = responses.expenseConfig.expenseRequest;

    this.setupExpenseConfig();
    this.setupJustificationForm();

    if (this.transactionId) {
      this.loadExistingExpenseRequest();
    }
  }

  // Setup initial dynamic form control based on expenseConfig request object.
  setupExpenseConfig() {

    if (!this.editMode) {
      this.route.data.subscribe(data => {
        this.title = data['title'];

        if (this.expenseConfig?.pageTitles) {
          this.moduleConfig.pageTitle = this.expenseConfig.pageTitles[this.title] || this.title;
        }

        this.categories = []; // reset categories to avoid duplicates

        this.expenseConfig?.category?.forEach((category: any) => {
          if (category?.displayPage?.[this.title]) {
            // Add only categories applicable for the current page
            this.categories.push(category);
          }
        });
      });
    } else {
      if (this.expenseClaimTypeDescription == 'Domestic' || this.expenseClaimTypeDescription == 'International') {
        if(this.travelRequestId) {
          this.title = "Travel Expense";
        } else {
          this.title = `Direct Expense ${this.expenseClaimTypeDescription}`;
        }
        
        if (this.expenseConfig?.pageTitles) {
          this.moduleConfig.pageTitle = this.expenseConfig.pageTitles[this.title] || this.title;
        }

        this.categories = []; // reset categories to avoid duplicates

        this.expenseConfig?.category?.forEach((category: any) => {
          if (category?.displayPage?.[this.title]) {
            // Add only categories applicable for the current page
            this.categories.push(category);
          }
        });
      }
    }

    if (this.expenseConfig?.request) {
      this.getTravelRequestList();
      const control = FormControlFactory.createControl(this.expenseConfig.request);
      this.formControls.push({ formConfig: this.expenseConfig.request, control: control });
      this.expenseRequestForm.addControl(this.expenseConfig.request.name, control);
      this.formControls = [];
    }
    if (this.expenseConfig?.travelDetails) {
      this.travelDetails = this.expenseConfig?.travelDetails;
      this.travelDetails.data?.forEach((config: any) => {
        if (config.controlType === 'autocomplete' && config.isEnabled) {
          this.initBillanleControl();
        }
      })
    }
    this.expenseConfig?.expenseLandingBox?.forEach((box: any) => {
      if (box?.displayPage?.[this.title]) {
        box.moduleData = { ...box.moduleData, UserMasterId: this.userMasterId };
        this.boxModuleData = box.moduleData;
        this.moduleConfig.page = box.name;
        this.moduleConfig[box.name] = box;
        this.moduleConfig.internationalFlag = box.international || false;
      }
    });
    this.setCurrencyDropdown();
    console.log("Expense Config: ", this.expenseConfig.summaries);
    this.expenseSummary = JSON.parse(JSON.stringify(this.expenseConfig.summaries));
    this.setExpenseSummary();
  }

  // Setup form categories with dynamic options mapping from master data.
  setupCategories() {
    // Number of travel days
    let travelDays = 0;
    if (this.travelRequestPreview?.travelDateFrom && this.travelRequestPreview?.travelDateTo) {
      const fromDate = new Date(this.travelRequestPreview.travelDateFrom);
      const toDate = new Date(this.travelRequestPreview.travelDateTo);
      travelDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    }

    this.categories?.forEach((category: any) => {
      if (!category?.travelDays) {
        category.travelDays = travelDays;
      }
      category.formControls?.forEach((control: any) => {
        if (control.apiDateLimit) {
          if (!control?.minDate) {
            control.minDate = this.travelRequestPreview?.travelDateFrom;
          }
          if (!control?.maxDate) {
            control.maxDate = this.travelRequestPreview?.travelDateTo;
          }
        }
      })
    });
    this.updateCategoryCounts();
    this.expenseSummary = JSON.parse(JSON.stringify(this.expenseConfig.summaries));
    this.setExpenseSummary();
  }

  setExpenseSummary() {
    this.expenseSummary.forEach((summary: any) => {
      if (summary.id === "category-wise-expense") {
        summary.items = summary.items.filter((item: any) => {
          const includesDomestic = item.includeIn.includes("domestic");
          const includesInternational = item.includeIn.includes("international");

          if (this.moduleConfig.internationalFlag === true) {
            // Show if item is for international or both
            return includesInternational;
          } else {
            // Show if item is for domestic or both
            return includesDomestic;
          }
        });
      }
    });
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
                

            this.populateExistingExpenseData(response);
          }
        }
      });
  }

  // Populate existing expense request data into form structure for editing.
  populateExistingExpenseData(response: any) {
    if (response?.travelRequestId == 0) {
      this.otherExpenseResponse = response;
      if (response?.claimTypeId == 53) {
        this.title = "Direct Expense Domestic";
        this.moduleConfig.pageTitle = "Direct Expense Domestic";
      }
      if (response?.claimTypeId == 54) {
        this.title = "Direct Expense International";
        this.moduleConfig.pageTitle = "Direct Expense International";
      }
      this.expenseConfig?.expenseLandingBox?.forEach((box: any) => {
        if (box?.displayPage?.[this.title]) {
          box.moduleData = { ...box.moduleData, UserMasterId: this.userMasterId };
          this.boxModuleData = box.moduleData;
          this.moduleConfig.page = box.name;
          this.moduleConfig[box.name] = box;
          this.moduleConfig.internationalFlag = box.international || false;
        }
      });
    }

    setTimeout(() => {
      this.expenseLandingBoxForm.patchValue(this.otherExpenseResponse, { emitEvent: false });
    }, 1000);

    this.travelRequestId = response.travelRequestId;
    this.justificationForm.get(this.expenseConfig.justification.controlName).setValue(response?.remarks);

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
    this.updateCategoryCounts();
    this.setCurrencyDropdown();

    setTimeout(() => {
      this.summaryComponent.calculatTotalExpenseAmount();
      this.summaryComponent.calculatCategoryWiseExpense();
      this.summaryComponent.calculateCostCenterWiseExpense();
    }, 1000);

    this.applyExcludedFields();
    this.onTabChange(0);
    this.getTravelRequestPreview();
  }

  // Update category item counts based on populated existing data.
  updateCategoryCounts() {
    this.moduleConfig.categories = [];
    this.categories?.forEach((cat: any) => {
      const matchedData = this.expenseRequestData?.dynamicExpenseDetailModels?.find((data: any) => data.name == cat.name);
      cat.count = matchedData ? matchedData.data.length : 0;

      this.moduleConfig.categories.push({
        name: cat.name,
        label: cat.label,
        count: cat.count
      });
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
            ReferenceId: entry.ReferenceId ?? 0,
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
    let filteredData = this.expenseRequestData?.dynamicExpenseDetailModels
      ?.find((t: any) => t.name === tabLabel)?.data || [];

    this.existingExpenseRequestData = filteredData?.map((data: any) => {
      // Make a shallow copy so the original stays unchanged
      const clonedData = { ...data };

      if (clonedData.excludedData) {
        Object.keys(clonedData.excludedData).forEach((key: string) => {
          clonedData[key] = clonedData.excludedData[key];
        });
        delete clonedData.excludedData;
      }

      return clonedData;
    });

  }

  onTabChangeIfAllowed(event: any) {
    if (event.index !== 5) {
      this.onTabChange(event);
    } else {
      this.selectedTabIndex = 0;
    }
  }

  // Set default currency for 'Currency' fields based on travel type.
  setCurrencyDropdown() {

    const isWithoutCurrency = [52, 54].includes(this.travelRequestPreview?.travelTypeId) || [52, 54].includes(this.expenseRequestData?.claimTypeId) || [52, 54].includes(this.boxModuleData?.claimTypeId);

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
        if (control?.name === 'Currency' || control?.name === 'EntitlementCurrency') {
          control.defaultValue = isWithoutCurrency ? null : defaultCurrency;
        }
      })
    );
  }


  // Fetch travel request preview and extract user, cost center, and purpose info.
  getTravelRequestPreview() {
    if (!this.travelRequestId) return;

    this.travelRequestId = Number(this.travelRequestId) || 0;
    let requestBody = {
      TravelRequestId: this.travelRequestId,
      ActionBy: this.userMasterId
    };

    this.newExpenseService.getTravelRequestBookedDetail(requestBody).pipe(take(1)).subscribe({
      next: (response) => {
        console.log("Travel Request Preview Response: ", response);
        const from = new Date(response?.travelDateFrom);
        const to = new Date(response?.travelDateTo);
        // Duration in milliseconds
        const durationMs = to.getTime() - from.getTime();

        // Duration in days (rounded to nearest integer)
        this.moduleConfig.tripDuration = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        this.categories = this.categories.filter((category: any) => {
          // Keep category if:
          // 1. showCategoryFor is not defined (so it's for all travel types)
          // 2. OR travelTypeId is included in showCategoryFor
          return !category.showCategoryFor || category.showCategoryFor.includes(response?.travelTypeId || response?.claimTypeId);
        });
        if (!this.editMode) {
          response?.dynamicExpenseDetailModels?.forEach((catdata: any) => {
            catdata.data?.forEach((data: any) => {
              data.ReferenceId = 0;
            });
          });
          this.responseData = JSON.parse(JSON.stringify(response));
          this.updateCategoryCounts();
          this.expenseRequestData = response;
          this.updateCategoryCounts();
          this.setCurrencyDropdown();

          setTimeout(() => {
            this.summaryComponent.calculatTotalExpenseAmount();
            this.summaryComponent.calculatCategoryWiseExpense();
            this.summaryComponent.calculateCostCenterWiseExpense();
          }, 1000);

          this.applyExcludedFields();
          this.selectedTabIndex = 0;
        }

        const preview = response;
        this.travelRequestPreview = { ...preview, UserMasterId: this.userMasterId };

        this.travelDetails?.data?.forEach((config: any) => {
          const prop = config.name;
          if (this.travelRequestPreview && this.travelRequestPreview.hasOwnProperty(prop)) {
            config.value = this.travelRequestPreview[prop];
          }
          if (this.travelRequestPreview?.travelRequestMetaData) {
            this.travelRequestPreview.travelRequestMetaData.forEach((meta: any) => {
              if (meta && meta.fieldName === prop) {
                config.value = meta.integerValueReference;
              }
            });
          }
        });
        this.travelDetails?.data?.sort((a: any, b: any) => a.order - b.order);

        const meta = this.travelRequestPreview.travelRequestMetaData || [];
        this.costcenterId = meta.find((d: any) => d.TravelRequestMetaId === 4)?.IntegerValue;
        this.purpose = meta.find((d: any) => d.TravelRequestMetaId === 1)?.IntegerValueReference;
        const internationalFlag = [52, 54].includes(this.travelRequestPreview?.travelTypeId) || [52, 54].includes(this.expenseRequestData?.claimTypeId);
        this.moduleConfig.internationalFlag = internationalFlag;
        this.setupCategories();
        this.setCurrencyDropdown();
        this.onTabChange(this.selectedTabIndex);
      },
      error: (error) => {
        console.error('Error fetching travel request booked detail:', error);
        this.travelRequestId = 0;
      }
    });

  }

  // Update travelRequestId based on user selection and fetch travel request preview.
  onSelectTravelExpenseRequest(event: MatSelectChange) {
    this.travelRequestId = Number(event?.value) || 0;

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
    this.updateCategoryCounts();
    this.summaryComponent.calculatTotalExpenseAmount();
    this.summaryComponent.calculatCategoryWiseExpense();
    this.summaryComponent.calculateCostCenterWiseExpense();
  }

  updateCategoryData(updated: { name: string, data: any[] }) {
    const categoryBlock = this.expenseRequestData?.dynamicExpenseDetailModels?.find((x: any) => x.name === updated.name);
    if (categoryBlock) {
      categoryBlock.data = updated.data;
    }
    this.applyExcludedFields();
    const tab = this.categories.find((c: any) => c.name === updated.name);
    if (tab) tab.count = updated.data.length;

    this.summaryComponent.calculatTotalExpenseAmount();
    this.summaryComponent.calculatCategoryWiseExpense();
    this.summaryComponent.calculateCostCenterWiseExpense();
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
        TravelTypeId: this.travelRequestPreview?.travelTypeId || this.boxModuleData?.travelTypeId || 0,
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
      if (window.innerWidth <= 768) {
        this.bottomSheet.dismiss();
      }
      if (this.editMode) {
        this.router.navigate(['../expense/expense/dashboard']);
        return;
      } else {
        this.router.navigate(['../expense/expense/landing']);
        return;
      }
    }

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
    if (this.moduleConfig.pageTitle === 'Travel Expense') {
      const isValid = this.validateAndPrepareMainExpenseDataForTravelExpense();
      if (!isValid) return;
    } else {
      const isValid = this.validateAndPrepareMainExpenseDataForOtherExpenses();
      if (!isValid) return;
    }

    console.log("Main Expense Data: ", this.mainExpenseData);

    const hasMissingFields = this.checkMissingRequiredFields(
      this.mainExpenseData.dynamicExpenseDetailModels,
      this.categories,
      this.confirmDialogService
    );

    if (hasMissingFields) return;

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
      TravelDateFrom: this.travelRequestPreview?.travelDateFromExtended,
      TravelDateTo: this.travelRequestPreview?.travelDateToExtended,
      remarks: this.travelRequestPreview?.travelRequestDateExtensionRemarks
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

  /**
   * Opens the expense summary sidebar in a bottom sheet on mobile devices.
   * @param templateRef Reference to the ng-template containing the sidebar content.
   */
  openExpenseSummarySheet(templateRef: TemplateRef<any>) {
    if (window.innerWidth <= 768) {
      this.bottomSheet.open(templateRef, {
        panelClass: 'expense-bottom-sheet'
      });
    }
  }

  // For mobile: open bottom sheet for travel request selection
  openRequestBottomSheet(templateRef: TemplateRef<any>) {
    this.bottomSheet.open(templateRef, {
      panelClass: 'expense-bottom-sheet'
    });
  }

  // For mobile: select a travel request from bottom sheet
  selectRequestFromSheet(req: any) {
    this.expenseRequestForm.get(this.expenseConfig.request.name)?.setValue(req.value);
    this.onSelectTravelExpenseRequest({ value: req.value } as any);
    this.bottomSheet.dismiss();
  }

  // For mobile: get label of selected travel request
  getSelectedRequestLabel(): string {
    const value = this.expenseRequestForm.get(this.expenseConfig.request.name)?.value;
    const found = this.travelRequests?.find((r: any) => r.value === value);
    return found ? found.label : '';
  }

  // For mobile: close the expense summary sheet
  closeExpenseSummarySheet() {
    this.bottomSheet.dismiss();
  }

  // For extra category selection
  onExtraCategorySelect(category: any) {
    this.selectedExtraCategory = category;
    // Optionally, update existingExpenseRequestData if needed for the dynamic form
    let filteredData = this.expenseRequestData?.dynamicExpenseDetailModels
      ?.find((t: any) => t.name === category?.name)?.data || [];

    this.existingExpenseRequestData = filteredData?.map((data: any) => {
      // Make a shallow copy so the original stays unchanged
      const clonedData = { ...data };

      if (clonedData.excludedData) {
        Object.keys(clonedData.excludedData).forEach((key: string) => {
          clonedData[key] = clonedData.excludedData[key];
        });
        delete clonedData.excludedData;
      }

      return clonedData;
    });

    const index = this.categories.findIndex((c: any) => c.name === category.name);
    if (index !== -1) {
      this.categories.splice(index, 1);
      this.categories.splice(4, 0, category);
    }
    this.selectedTabIndex = 4; // Update selected tab index
  }

  // For *ngFor trackBy
  trackByReq(index: number, req: any) {
    return req.value;
  }

  onOptionSelected(event: any, item: any) {
    const selectedDisplay = event.option.value;
    const selected = this.filteredOptions.find((opt: any) => opt[item.displayKey] === selectedDisplay);

    if (selected) {
      item.value = selected[item.displayKey];
      this.updateBillableCostCentre(selected[item.valueKey]);
    }
  }

  updateBillableCostCentre(billableCostcentreId: number) {
    this.mainExpenseData.BillableCostCentreId = billableCostcentreId;
  }

  // Call this from (autoCompleteFocus) output of your text input component
  onAutoCompleteFocus(focusedControlConfig: any) {
    // Clear options for all other autocomplete controls except the focused one
    this.categories?.forEach((category: any) => {
      category.formControls?.forEach((control: any) => {
        if (
          control.autoComplete &&
          control.name !== focusedControlConfig.name &&
          Array.isArray(control.options)
        ) {
          control.options = [];
        }
      });
    });
  }

  validateAndPrepareMainExpenseDataForTravelExpense(): boolean {
    const requestData = this.expenseRequestData?.dynamicExpenseDetailModels;

    // Check for required data presence
    if (!this.travelRequestId || !requestData) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return false;
    }

    // Check for required data presense in all requested categories
    const hasRequiredData = requestData.some((category: any) => {
      return category.data && category.data.length > 0;
    });

    if (!hasRequiredData) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return false;
    }

    if (this.travelRequestId > 0 && requestData.length === 0) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return false;
    }

    // Validate Billable control
    if (this.billableControl.invalid) {
      this.billableControl.markAsTouched();
      return false;
    }

    // Validate main form
    if (this.expenseRequestForm.invalid) {
      this.expenseRequestForm.markAllAsTouched();
      return false;
    }

    // Validate justification form
    if (this.justificationForm.invalid) {
      this.justificationForm.markAllAsTouched();
      return false;
    }

    // All validations passed, prepare data
    this.mainExpenseData = {
      ...this.mainExpenseData,
      ExpenseRequestId: this.expenseRequestId,
      RequestForId: this.travelRequestPreview.requestForId,
      RequesterId: this.userMasterId,
      TravelRequestId: this.travelRequestPreview.travelRequestId,
      RequestDate: new Date().toISOString(),
      Purpose: this.purpose,
      CostCentreId: this.costcenterId,
      BillableCostCentreId: this.costcenterId,
      Remarks: this.justificationForm.get(this.expenseConfig.justification.controlName)?.value,
      ActionBy: this.userMasterId,
      dynamicExpenseDetailModels: this.utilsService.simplifyObject(requestData)
    };

    return true;
  }

  validateAndPrepareMainExpenseDataForOtherExpenses(): boolean {
    const requestData = this.expenseRequestData?.dynamicExpenseDetailModels;

    // Validate expenseLandingBoxForm
    if (this.expenseLandingBoxForm.invalid) {
      this.expenseLandingBoxForm.markAllAsTouched();
      return false;
    }

    // Check for required data presence
    if (!requestData || requestData.length === 0) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return false;
    }
    // Check for required data presense in all requested categories
    const hasRequiredData = requestData.some((category: any) => {
      return category.data && category.data.length > 0;
    });

    if (!hasRequiredData) {
      this.snackbarService.error(this.expenseConfig.notifications.AtLeastOneClaimDataEntry);
      return false;
    }

    // Validate main form
    if (this.expenseRequestForm.invalid) {
      this.expenseRequestForm.markAllAsTouched();
      return false;
    }

    // Validate justification form
    if (this.justificationForm.invalid) {
      this.justificationForm.markAllAsTouched();
      return false;
    }
    console.log('valid',this.mainExpenseData)
    this.mainExpenseData = {
      ...this.mainExpenseData,
      ...this.boxModuleData,
      ...this.expenseLandingBoxForm.value,
      ExpenseRequestId: this.expenseRequestId,
      RequesterId: this.userMasterId,
      TravelRequestId: 0,
      RequestDate: new Date().toISOString(),
      Remarks: this.justificationForm.get(this.expenseConfig.justification.controlName)?.value,
      ActionBy: this.userMasterId,
      dynamicExpenseDetailModels: this.utilsService.simplifyObject(requestData)
    };

    return true;
  }

  checkMissingRequiredFields(
    dynamicExpenseDetailModels: any[],
    categories: any[],
    confirmDialogService: any
  ): boolean {
    const isEmptyValue = (val: any): boolean =>
      val === undefined ||
      val === null ||
      val === '' ||
      val === '0001-01-01T00:00:00' ||
      val === '1970-01-01T00:00:00';

    const missingFieldsByCategory = dynamicExpenseDetailModels
      .map((expenseCategory: any) => {
        const configCategory = categories.find(
          (cat: any) => expenseCategory?.data?.length > 0 && cat.name === expenseCategory.name
        );
        if (!configCategory) return null;

        const requiredFields = configCategory.formControls
          .filter((control: any) => control.required && !control.isExcluded)
          .map((control: any) => control.name);

        const missingInItems = expenseCategory.data
          .map((item: any, index: number) => {
            const missing = requiredFields.filter((field: string) => {
              const value = item[field] ?? item.excludedData?.[field];
              return isEmptyValue(value);
            });
            return missing.length > 0 ? { index, missing } : null;
          })
          .filter(Boolean);

        if (missingInItems.length === 0) return null;

        return {
          categoryName: expenseCategory.name,
          items: missingInItems
        };
      })
      .filter(Boolean);

    if (missingFieldsByCategory.length > 0) {
      const missingFieldsMessage = missingFieldsByCategory
        .map((cat: any) => {
          const itemsText = cat.items
            .map((item: any) => `Row ${item.index + 1}: ${item.missing.join(', ')}`)
            .join('\n');
          return `${cat.categoryName}:\n${itemsText}`;
        })
        .join('\n\n');

      confirmDialogService.confirm({
        title: 'Missing Required Fields',
        message: `Please fill in the following required fields:\n\n${missingFieldsMessage}`,
        confirmText: 'OK',
        cancelButton: false
      }).subscribe();

      return true;
    }

    return false;
  }


  getFormValue(form: any) {
    this.expenseLandingBoxForm = form;

    const fromDate = this.expenseLandingBoxForm.get('travelDateFrom')?.value;
    const toDate = this.expenseLandingBoxForm.get('travelDateTo')?.value;

    if (fromDate && toDate && this.expenseLandingBoxForm.get('travelDateFrom')?.valid && this.expenseLandingBoxForm.get('travelDateTo')?.valid) {
      this.categories = this.categories.map((category: any) => {
        const updatedControls = category.formControls.map((control: any) => {
          if (control.apiDateLimit) {
            return {
              ...control,
              minDate: fromDate,
              maxDate: toDate
            };
          }
          return control;
        });

        return {
          ...category,
          formControls: updatedControls
        };
      });

      console.log("Updated categories with date limits:", this.categories);
    }
  }

  getDateInputComponentValue(dateInputComponents: any) {
    console.log("Date Input Components: ", dateInputComponents);
    this.expenseConfig?.expenseLandingBox?.forEach((box: any) => {
      if (box?.displayPage?.[this.title]) {
        box.formControls.forEach((control: any) => {
          if (control.type === 'date') {
            dateInputComponents.forEach((dateInput: any) => {
              if (dateInput.timeControl && dateInput.controlConfig.name === control.name) {
                // If the value is a date string, convert it to a Date object
                const dateValue = this.expenseLandingBoxForm.get(control.name)?.value;
                if (dateValue && typeof dateValue === 'string') {
                  dateInput.timeControl.setValue(dateValue);
                  dateInput.control.setValue(dateValue);
                }
              }
            });
          }
        });
      }
    });
  }

}


