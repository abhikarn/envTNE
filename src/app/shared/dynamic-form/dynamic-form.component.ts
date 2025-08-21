import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl } from './form-control.interface';
import { DatePipe } from '@angular/common';

import { TextInputComponent } from './form-controls/input-control/text-input.component';
import { SelectInputComponent } from './form-controls/dropdown/select-input.component';
import { DateInputComponent } from './form-controls/calender/date-input.component';
import { TextAreaInputComponent } from './form-controls/text-area/text-area-input.component';
import { MultiSelectInputComponent } from './form-controls/multi-select/multi-select-input.component';
import { FileUploadComponent } from './form-controls/file-upload/file-upload.component';
import { DynamicTableComponent } from '../component/dynamic-table/dynamic-table.component';
import { RadioInputComponent } from './form-controls/radio/radio-input.component';
import { GstComponent } from './form-controls/gst/gst.component';
import { ServiceRegistryService } from '../service/service-registry.service';
import { ConfirmDialogService } from '../service/confirm-dialog.service';
import { GlobalConfigService } from '../service/global-config.service';
import { LineWiseCostCenterComponent } from './form-controls/cost-center/line-wise-cost-center/line-wise-cost-center.component';
import { CostCenterComponent } from "./form-controls/cost-center/cost-center.component";
import { SnackbarService } from '../service/snackbar.service';
import { UtilsService } from '../service/utils.service';
import { DynamicFormService } from '../service/dynamic-form.service';
import { DynamicTableService } from '../service/dynamic-table.service';
import { TextAutocompleteComponent } from './form-controls/text-autocomplete/text-autocomplete.component';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import _moment from 'moment';
import { QuotationComponent } from './form-controls/quotation/quotation.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    SelectInputComponent,
    DateInputComponent,
    TextAreaInputComponent,
    MultiSelectInputComponent,
    FileUploadComponent,
    DynamicTableComponent,
    RadioInputComponent,
    GstComponent,
    CostCenterComponent,
    TextAutocompleteComponent,
    QuotationComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [DatePipe]
})

export class DynamicFormComponent implements OnInit, OnChanges {
  @ViewChild(QuotationComponent) quotationComponentRef!: QuotationComponent;
  @ViewChild(CostCenterComponent) costCenterComponentRef!: CostCenterComponent;
  @ViewChild(GstComponent) gstComponentRef!: GstComponent;
  @ViewChildren(DateInputComponent) dateInputComponentRef!: QueryList<DateInputComponent>;
  @Input() moduleData: any;
  @Input() category: any;
  @Input() formConfig: IFormControl[] = [];
  @Input() eventHandler: any;
  @Input() existingData: any;
  @Input() moduleConfig: any;
  @Input() displayTable: boolean = false;
  @Input() displayAddClearButton: boolean = true;
  @Output() emitFormData = new EventEmitter<any>();
  @Output() emitFormValue = new EventEmitter<any>();
  @Output() emitTextData = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();
  @Output() emitDateInputComponentValue = new EventEmitter<any>();
  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  tableData: any = [];
  selectedRow: any;
  formData: any = {};
  editIndex = 0;
  referenceId = 0;
  isValid = true;
  selectedFiles: any = [];
  isClearing = false;
  isTravelRaiseRequest: boolean = false;

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private confirmDialogService: ConfirmDialogService,
    private configService: GlobalConfigService,
    private snackbarService: SnackbarService,
    private dynamicFormService: DynamicFormService,
    private dynamicTableService: DynamicTableService,
    private datePipe: DatePipe // inject DatePipe
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingData'] && this.existingData?.length) {
      this.prepareOptions(this.existingData).then(() => {
        this.dynamicTableService.populateTableData(this.existingData, this.formControls).then((dataArray: any[]) => {
          this.tableData = dataArray;
        });
      });
    }
  }

  private async prepareOptions(dataArray: any[]): Promise<void> {
    const controlLoaders: Promise<void>[] = [];

    this.formConfig
      ?.filter(ctrl => (ctrl.payloadKey) && ctrl.apiService && ctrl.apiMethod)
      .forEach((ctrl: any) => {
        const service = this.serviceRegistry.getService(ctrl.apiService);
        const apiMethod = ctrl.apiMethod;

        if (!service || typeof service[apiMethod] !== 'function') return;

        const labelKey = ctrl.labelKey || 'label';
        const valueKey = ctrl.valueKey || 'value';
        const payloadKey = ctrl.payloadKey || ctrl.dependsOn;

        const optionCache = new Map<string, any[]>(); // key: payloadValue, value: options

        dataArray.forEach(row => {
          const payloadValue = ctrl.dependsOn ? row[ctrl.dependsOn] : null;
          const cacheKey = payloadValue ?? 'default';

          if (optionCache.has(cacheKey)) return;

          const payload: any = {};
          if (payloadKey && payloadValue != null) {
            payload[payloadKey] = payloadValue;
          }

          const loadOptions = service[apiMethod](payload).toPromise().then((response: any) => {
            const options = response.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
            optionCache.set(cacheKey, options);
          });

          controlLoaders.push(loadOptions);
        });

        // Attach cache to control for label mapping later
        ctrl.optionCache = optionCache;
      });

    await Promise.all(controlLoaders);
  }

  ngOnInit() {
    console.log(this.moduleData);
    this.category = this.dynamicFormService.getCategoryConfig(this.category, this.moduleConfig);
    this.formControls = []; // Reset to avoid duplication
    this.form = new FormGroup({});
    this.formConfig = this.dynamicFormService.getFormConfig(this.formConfig, this.moduleConfig);
    this.formConfig.forEach(config => {
      if (config.dataType === 'numeric') {
        this.setupAutoFormat(config, this.configService);
      }
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
    });
    if (this.category?.onInitAPI) {
      // Populate form with initial API data if available
      this.dynamicFormService.populateFormWithData(this.form, this.category.onInitAPI, this.moduleData);
    }
    this.form.reset();

    this.form.valueChanges
      .pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        this.emitFormValue.emit(this.form);
        this.emitDateInputComponentValue.emit(this.dateInputComponentRef || []);
      });

  }

  setupAutoFormat(config: any, configService: GlobalConfigService): void {
    const globalPrecision = configService.getDecimalPrecision();
    const controlPrecision = parseInt(config?.autoFormat?.decimalPrecision ?? '', 10);

    const finalPrecision = !isNaN(controlPrecision) ? controlPrecision : globalPrecision;
    const decimalStr = `.${'0'.repeat(finalPrecision)}`; // e.g. .00, .000

    if (!config.autoFormat) {
      config.autoFormat = {};
    }

    config.autoFormat.decimal = decimalStr; // inject calculated format
  }

  onDropdownValueChange({ event, control }: { event: any; control: IFormControl }) {
    const changedControlName = control.name;
    const selectedValue = event.value;

    this.formConfig.forEach((ctrlConfig: any) => {
      if (ctrlConfig.dependsOn === changedControlName) {
        const service = this.serviceRegistry.getService(ctrlConfig.apiService);
        const apiMethod = ctrlConfig.apiMethod;
        const payloadKey = ctrlConfig.payloadKey || `${changedControlName}Id`; // fallback if not defined

        const payload = { [payloadKey]: selectedValue }; // Dynamic payload

        if (service && typeof service[apiMethod] === 'function') {
          service[apiMethod](payload).subscribe((data: any) => {
            const labelKey = ctrlConfig.labelKey || 'label';
            const valueKey = ctrlConfig.valueKey || 'value';
            ctrlConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));

            // Reset dependent control
            const dependentControl = this.form.get(ctrlConfig.name);
            dependentControl?.reset();
          });
        }
      }
    });
    this.dynamicFormService.updateConditionalValidators(this.form, this.formConfig);
  }

  /**
   * Handles dynamic event execution
   * @param eventType - Event type (e.g., change, input)
   * @param data - Event payload from lib-select-input
   */
  handleEvent(eventType: string, data: { event: any; control: any }) {
    const field = data.control;
    const event = data.event;
    const handlerName = field.events?.[eventType];

    if (handlerName && typeof this.eventHandler[handlerName] === 'function') {
      this.eventHandler[handlerName](event, field);
    } else {
      console.warn(`Handler '${handlerName}' is not defined for ${field.name}.`);
    }
  }

  async onSubmit() {
    console.log('Form submitted:', this.form.value);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dynamicFormService.scrollToFirstInvalidControl('form');
      this.scrollToFirstInvalidControl();
      return;
    }
    // enable all controls before submission
    this.formControls.forEach(control => {
      if (control.control.disabled) {
        control.control.enable({ emitEvent: false });
      }
    });

    if (this.category.checkValidationOnSubmit?.costCenter) {
      for (const validation of this.category.checkValidationOnSubmit.costCenter) {
        if (validation.AmountMustMatchClaimAmount && validation.dependsOn?.length >= 2) {
          const [claimAmountField, costCenterField] = validation.dependsOn;

          const costCenterData = this.form.value?.[costCenterField] || [];
          if (costCenterData.length > 0) {
            const claimAmountRaw = this.form.value?.[claimAmountField];
            const claimAmount = parseFloat(
              typeof claimAmountRaw === 'string' ? claimAmountRaw.replace(/,/g, '') : claimAmountRaw
            ) || 0;

            const totalCostCenterAmount = costCenterData.reduce((sum: number, item: any) => {
              const rawAmount = item?.AmmoutInActual;
              const amount = parseFloat(
                typeof rawAmount === 'string' ? rawAmount.replace(/,/g, '') : rawAmount
              );
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            const isMatch = Math.abs(totalCostCenterAmount - claimAmount) < 0.01;

            if (!isMatch) {
              this.snackbarService.error(validation.AmountMustMatchClaimAmount, 5000);
              if (this.editIndex && this.isTravelRaiseRequest) {
                this.freezeControlsBasedOnConditions();
              }
              return;
            }
          }
        }
      }
    }

    if (this.category.checkValidationOnSubmit?.policyCheck) {
      for (const policy of this.category.checkValidationOnSubmit.policyCheck) {

        const requiredFields = ['NoOfTimes', 'Frequency', 'Duration', 'ClaimDate'];
        const dependsOn = policy.dependsOn ?? Object.keys(policy.fieldList ?? {});

        const hasAllFields = requiredFields.every(field => dependsOn.includes(field));
        if (!hasAllFields) continue;

        // Get policy values from config
        const frequency = +this.form.get('Frequency')?.value;
        const noOfTimes = +this.form.get('NoOfTimes')?.value;
        const duration = +this.form.get('Duration')?.value;

        // last claim date from existing data
        const categoryData = this.moduleConfig?.categories?.find((cat: any) => cat.name === this.category.name)
        if (!categoryData) continue;

        const lastClaimDateStr = categoryData.data?.[categoryData.data.length - 1]?.excludedData?.ClaimDate;
        if (!lastClaimDateStr) continue;

        const lastClaim = new Date(lastClaimDateStr);
        const now = new Date();

        const diffInMonths = (now.getFullYear() - lastClaim.getFullYear()) * 12 + (now.getMonth() - lastClaim.getMonth());

        if (diffInMonths < frequency * 12 && !this.editIndex) {
          const lastClaimFormatted = this.datePipe.transform(lastClaim, 'dd-MMM-yyyy');
          this.snackbarService.error(
            `${this.category.label} are limited to ${noOfTimes} every ${frequency} years`,
            5000
          );

          if (this.editIndex && this.isTravelRaiseRequest) {
            this.freezeControlsBasedOnConditions();
          }
          return;
        }
      }
    }

    if (this.category.checkValidationOnSubmit?.quotationCheck) {
      for (const validation of this.category.checkValidationOnSubmit.quotationCheck) {
        const { minimumNumberOfQuotation } = validation;

        const quotationCount = this.form.get('quotation')?.value?.length || 0;
        if (quotationCount < minimumNumberOfQuotation) {
          this.snackbarService.error(
            `At least ${minimumNumberOfQuotation} quotations are required.`,
            5000
          );
          if (this.editIndex && this.isTravelRaiseRequest) {
            this.freezeControlsBasedOnConditions();
          }
          return;
        }
      }
    }

    if (this.category.checkValidationOnSubmit?.multipleAttachmentValidation) {
      for (const validation of this.category.checkValidationOnSubmit.multipleAttachmentValidation) {
        const { requiredDocumentType, dependsOn } = validation;

        // Determine the attachment field name from config (default to "attachment")
        const fieldName = dependsOn?.[0] || 'attachment';
        const attachments = this.form.get(fieldName)?.value || [];

        const missingDocuments = requiredDocumentType.filter((doc: any) => {
          return !attachments.some((att: any) => {
            // Match by ID if available, otherwise match by name
            return att?.ReferenceType === doc.id;
          });
        });

        if (missingDocuments.length > 0) {
          const docNames = missingDocuments.map((doc: any) => doc.name).join(', ');
          this.snackbarService.error(`Missing required documents: ${docNames}`, 5000);
          if (this.editIndex && this.isTravelRaiseRequest) {
            this.freezeControlsBasedOnConditions();
          }
          return; // stop further processing
        }
      }
    }


    // claim restriction check
    if (this.category.claimRestriction && this.category.claimRestriction.length > 0) {
      for (const claimRestriction of this.category.claimRestriction) {

        // 1. Duplicate Category Check
        if (claimRestriction.duplicateCategoryCheck && Array.isArray(claimRestriction.categories)) {
          const isClaimed = claimRestriction.categories.some((restriction: any) => {
            return this.moduleConfig.categories?.some((cat: any) => {
              return cat.name === restriction.name && cat.count > 0;
            });
          });

          if (isClaimed) {
            const restrictionMessage = claimRestriction.categories
              .map((restriction: any) => restriction.message || `Claim for ${restriction.name} is restricted.`)
              .join(' ');
            this.snackbarService.error(restrictionMessage, 5000);
            if (this.editIndex && this.isTravelRaiseRequest) {
              this.freezeControlsBasedOnConditions();
            }
            return;
          }
        }

        // 2. Minimum Stay Duration Check
        if (claimRestriction.minimumStayduration) {
          if (this.moduleConfig.tripDuration <= claimRestriction.minimumStayduration) {
            this.snackbarService.error(
              claimRestriction.message || `Minimum stay duration of ${claimRestriction.minimumStayduration} days is required.`,
              5000
            );
            if (this.editIndex && this.isTravelRaiseRequest) {
              this.freezeControlsBasedOnConditions();
            }
            return;
          }
        }

        // 3. Duplicate Claim Check
        if (claimRestriction.duplicateClaimedCheck) {
          const isDuplicate = this.dynamicFormService.checkDuplicateClaim(this.form, claimRestriction, this.moduleData.dynamicExpenseDetailModels, 'fieldsToCompare', 'dateRangeFieldsKey');

          if (isDuplicate) {
            this.snackbarService.error(`Duplicate claim detected in ${claimRestriction.name}.`, 5000);
            if (this.editIndex && this.isTravelRaiseRequest) {
              this.freezeControlsBasedOnConditions();
            }
            return;
          }
        }

      };
    }

    this.dynamicFormService.setCalculatedFields(this.form, this.formControls);

    // Only check duplicate if OCRRequired is true for this category
    if (this.category.OCRRequired) {
      // Check for duplicate in tableData before DB check
      const duplicateFields = this.category.duplicateCheckFields || [];
      const currentFormValues: any = {};
      for (const field of duplicateFields) {
        currentFormValues[field.name] = this.form.get(field.name)?.value;
      }
      const isDuplicateInTable = this.tableData.some((row: any, idx: number) => {
        // If editing, skip the row being edited
        if (this.editIndex && (idx === this.editIndex - 1)) return false;
        return duplicateFields.every((field: any) => {
          const formValue = currentFormValues[field.name];
          const rowValue = row[field.name];
          // Compare primitive or object with value property
          const val1 = typeof formValue === 'object' && formValue !== null ? formValue.value : formValue;
          const val2 = typeof rowValue === 'object' && rowValue !== null ? rowValue.value : rowValue;
          return val1 == val2;
        });
      });
      if (isDuplicateInTable) {
        this.snackbarService.success('Duplicate OCR entry detected in the expense items. Please check your Bill Number, Date, Amount, or Vendor Name.', 1000000)
        // return;
      }
      // Check for duplicate in DB:
      // - On create (editIndex === 0)
      // - On edit if OCRLogId is a number (user changed/uploaded bill)
      let ocrLogId = this.form.value.OCRLogId;
      let shouldCheckDuplicate = this.editIndex === 0 || (this.editIndex > 0 && (typeof ocrLogId === 'number' || ocrLogId == undefined || ocrLogId == null));
      if (shouldCheckDuplicate) {
        let isDuplicate = await this.checkOCRDuplicate();
        if (isDuplicate) {
          this.snackbarService.success('Duplicate OCR entry detected. Please check your Bill Number, Date, Amount, or Vendor Name.', 1000000)
          // return;
        }
      }
    }
    if (this.form.value?.costcentreWiseExpense?.length > 0) {
      const costCenterData = this.form.value?.costcentreWiseExpense || [];
      // total sum of Amount in percentage for all items should be equal to 100
      const totalPercentage = costCenterData.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.AmmoutInPercentage) || 0);
      }, 0);
      if (totalPercentage !== 100) {
        this.snackbarService.error('Total percentage of cost centers must equal 100%. Please check your entries.', 5000);
        if (this.editIndex && this.isTravelRaiseRequest) {
          this.freezeControlsBasedOnConditions();
        }
        return;
      }
    }
    if (this.category?.noOfEntryCheck && this.existingData?.length > this.category.travelDays) {
      this.snackbarService.error(`You can only add ${this.category.travelDays} entries for this category.`, 5000);
      if (this.editIndex && this.isTravelRaiseRequest) {
        this.freezeControlsBasedOnConditions();
      }
      return;
    }

    if (this.existingData?.length > 0) {
      if (this.category?.duplicateEntryCheck) {
        const { fields, name, skipTimeCheck } = this.category.duplicateEntryCheck;
        if (!fields || fields.length === 0) return;

        // If only one field (e.g., single date) is provided
        if (fields.length === 1) {
          const [field] = fields;

          if (skipTimeCheck) {
            // If skipTimeCheck is true, compare only the date part
            const newDate = this.datePipe.transform(this.form.value[field], 'yyyy-MM-dd');
            const isDuplicate = this.existingData.some((row: any, index: number) => {
              if (this.editIndex !== null && index === (this.editIndex - 1)) return false;

              const existingDate = this.datePipe.transform(row[field], 'yyyy-MM-dd');
              return newDate === existingDate;
            });
            if (isDuplicate) {
              this.snackbarService.error(`${name} for ${this.datePipe.transform(this.form.value[field], 'yyyy-MM-dd')} has already been claimed.`, 5000);
              if (this.editIndex && this.isTravelRaiseRequest) {
                this.freezeControlsBasedOnConditions();
              }
              return;
            }
          } else {
            const newDate = new Date(this.form.value[field]).getTime();

            const isDuplicate = this.existingData.some((row: any, index: number) => {
              if (this.editIndex !== null && index === (this.editIndex - 1)) return false;

              const existingDate = new Date(row[field]).getTime();
              return newDate === existingDate;
            });
            if (isDuplicate) {
              this.snackbarService.error(`${name} for ${this.form.value[field]} has already been claimed.`, 5000);
              if (this.editIndex && this.isTravelRaiseRequest) {
                this.freezeControlsBasedOnConditions();
              }
              return;
            }
          }
        }

        // If two fields (range comparison)
        if (fields.length === 2) {
          const [checkInField, checkOutField] = fields;
          const newCheckIn = new Date(this.form.value[checkInField]);
          const newCheckOut = new Date(this.form.value[checkOutField]);

          const isConflict = this.existingData.some((row: any, index: number) => {
            // Skip if it's the same row being edited
            if (this.editIndex !== null && index === (this.editIndex - 1)) return false;

            const existingCheckIn = new Date(row[checkInField]);
            const existingCheckOut = new Date(row[checkOutField]);

            return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
          });

          if (isConflict) {
            this.snackbarService.error(`${name} for the date ${this.form.value[checkInField]} - ${this.form.value[checkOutField]} has already been claimed.`, 5000);
            if (this.editIndex && this.isTravelRaiseRequest) {
              this.freezeControlsBasedOnConditions();
            }
            return;
          }
        }
      }
    }

    this.validatePolicyViolation();
  }

  validateManualPolicyViolation() {
    const policyChecks = this.category.policyViolationManualCheck;
    if (!Array.isArray(policyChecks) || policyChecks.length === 0) {
      // No violations defined
      this.proceedWithSubmission();
      return;
    }

    const checkNext = (index: number) => {
      if (index >= policyChecks.length) {
        // No more violations to check
        this.proceedWithSubmission();
        return;
      }

      const currentCheck = policyChecks[index];

      // If checkIfTrue is specified and is false, skip this check
      if (currentCheck.checkIfTrue && !this.form.get(currentCheck.checkIfTrue)?.value) {
        checkNext(index + 1);
        return;
      }

      // Prepare control values for formula evaluation
      const controls = currentCheck.controls;
      const controlValues: any = {};
      for (const [key, value] of Object.entries(controls)) {
        controlValues[key] = this.form.get(value as string)?.value;
      }

      const isViolation = this.dynamicFormService.evaluateFormula(currentCheck.formula, controlValues);
      console.log('Checking violation formula:', currentCheck.formula, 'Result:', isViolation, 'Values:', controlValues);

      if (isViolation) {
        this.form.get('IsViolation')?.setValue(true);
        // Show confirmation dialog
        this.confirmDialogService.confirm(currentCheck.confirmPopup).subscribe((confirmed: boolean) => {
          if (confirmed) {
            // Proceed to next violation check
            checkNext(index + 1);
          } else {
            // User cancelled
            this.form.get('IsViolation')?.setValue(false);
            return;
          }
        });
      } else {
        // Not violated, move to next
        checkNext(index + 1);
      }
    };

    checkNext(0); // Start from the first check
  }

  proceedWithSubmission() {
    this.setAutoCompleteFields();
    this.prepareFormJson();
    this.addDataToDynamicTable();
    setTimeout(() => {
      this.clear();
    }, 500);
  }


  /**
   * Calls the OCR duplicate check API and returns true if duplicate found, false otherwise.
   * Uses duplicateCheckFields from category config.
   */
  async checkOCRDuplicate(): Promise<boolean> {

    // Use duplicateCheckFields from category config
    const duplicateFields = this.category.duplicateCheckFields || [];
    const payload: any = {};

    // Collect required fields for duplicate check
    for (const field of duplicateFields) {
      const value = this.form.get(field.name)?.value;
      if (field.isRequired) {
        // If any required field is missing, skip duplicate check
        payload[field.name] = value;
      }
    }

    // Find the service and method for OCR duplicate check
    const ocrService = this.serviceRegistry.getService('NewExpenseService');
    if (!ocrService || typeof ocrService['OCRValidateCheck'] !== 'function') {
      // Service or method not found, skip check
      return false;
    }

    try {
      const response = await ocrService['OCRValidateCheck'](payload).toPromise();
      // Assuming API returns { responseValue: "Exist" } for duplicate
      if (response && response.responseValue === "Exist") {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  setAutoCompleteFields() {
    // Logic for autocomplete field like city to save the object value for display purpose
    this.formControls.forEach(control => {
      let { name, autoComplete } = control.formConfig;
      if (autoComplete && name in this.form.value) {
        let selected = this.form.value[name];
        if (selected && typeof selected == "object") {
          if (!control.formConfig.options) {
            control.formConfig.options = [];
          }
          control.formConfig.options.push(selected);
          selected = selected.value;
        }
        this.form.get(name)?.setValue(selected);
      }
    });
  }

  prepareFormJson() {
    // Preparing form json
    this.formData.name = this.category.name;
    this.formControls.forEach(control => {
      const type = control.formConfig.type;
      const fieldName = control.formConfig.name;
      let fieldValue: any;
      if (control.formConfig.inPayload === false) {
        fieldValue = control.formConfig.value;
        this.form.get(fieldName)?.setValue(fieldValue);
      } else {
        fieldValue = this.form.value[fieldName];
      }

      control.formConfig.value = fieldValue;
      if (!this.formData.data) {
        this.formData.data = {
          ReferenceId: 0
        };
      } else {
        this.formData.data.ReferenceId = this.referenceId
      }
      if (!this.formData.data?.excludedData) {
        this.formData.data.excludedData = {};
      }
      if (control.formConfig.isExcluded) {
        this.formData.data.excludedData[fieldName] = fieldValue != undefined ? fieldValue : null;
      } else {
        this.formData.data[fieldName] = fieldValue != undefined ? fieldValue : null;
      }
    })
    this.emitFormData.emit({
      formData: this.formData,
      editIndex: this.editIndex - 1
    });
    this.formData = {};
  }

  addDataToDynamicTable() {
    let tableData = this.form;
    // Preparing Data for Dynamic table
    this.formControls.forEach(control => {
      const { type, name, autoComplete, options } = control.formConfig;
      if ((type == "select" || autoComplete) && name in this.form.value) {
        let selected = this.form.value[name];
        if (selected && typeof selected == "object") {
          selected = selected.value;
        }
        const matchedOption = options?.find(option => option.value === selected);
        if (matchedOption) {
          tableData.get(name)?.setValue(matchedOption);
        }
      }
    });

    if (!this.editIndex) { //Create
      this.tableData.push(tableData.value);
      this.existingData.push(tableData.value);
    } else { // Edit
      this.tableData[this.editIndex - 1] = tableData.value;
      this.existingData[this.editIndex - 1] = tableData.value;
      this.editIndex = 0;
    }
  }

  onEditRow(rowData: any) {
    if (rowData?.row?.IsActual) {
      const fieldsToRemove = [
        'EntitlementCurrency',
        'EntitlementAmount',
        'EntitlementConversionRate',
        'DifferentialAmount'
      ];

      fieldsToRemove.forEach(field => {
        this.form.removeControl(field);
        const control = this.formControls.find(c => c.formConfig?.name === field);
        if (control) {
          control.formConfig.required = false;
          control.formConfig.showInUI = false;
        }
      });
    }

    console.log('Editing row:', rowData);
    if (rowData.row?.costcentreWiseExpense?.length > 0) {
      this.costCenterComponentRef?.setMultipleCostCenterFlag(true);
      this.costCenterComponentRef.costCenterData = rowData.row?.costcentreWiseExpense;
    }
    if (rowData.row?.gst?.length > 0) {
      this.gstComponentRef.setCompanyGSTFlag(true);
      this.gstComponentRef.gstData = rowData.row?.gst;
    }
    if (rowData.row?.quotation?.length > 0) {
      this.quotationComponentRef.quotationData = rowData.row?.quotation;
    }
    this.selectedFiles = rowData.row?.attachment;
    this.editIndex = rowData.index;
    this.referenceId = rowData.row.ReferenceId || 0;
    this.selectedRow = { ...rowData.row };

    this.formControls.forEach((control: any) => {
      const { name, type } = control.formConfig;

      if (!this.form.controls[name]) return;

      const value = this.selectedRow[name];

      if (type === 'select') {
        if (control.formConfig.payloadKey) {
          const service = this.serviceRegistry.getService(control.formConfig.apiService);
          const apiMethod = control.formConfig.apiMethod;
          const dependsOnValue = this.selectedRow[control.formConfig.dependsOn || ''];
          const payloadValue = typeof dependsOnValue === 'object' ? dependsOnValue?.value : dependsOnValue;

          const payload = {
            [control.formConfig.payloadKey || 'id']: payloadValue
          };
          service?.[apiMethod]?.(payload).subscribe((data: any) => {
            const labelKey = control.formConfig.labelKey || 'label';
            const valueKey = control.formConfig.valueKey || 'value';
            control.formConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
          });
        }
        // If the value is an object with `.value`, extract it
        this.form.controls[name].setValue(typeof value === 'object' && value !== null ? value.value : value);
      } else if (type === 'date') {
        this.dateInputComponentRef.forEach((dateInput: DateInputComponent) => {
          if (dateInput.timeControl && dateInput.controlConfig.name === name) {
            // If the value is a date string, convert it to a Date object
            const dateValue = value ? new Date(value) : null;
            dateInput.timeControl.setValue(dateValue);
            dateInput.control.setValue(dateValue);
          }
        });
      } else {
        this.form.controls[name].setValue(value);
      }
    });

    this.formControls.forEach((control: any) => {
      // Call with just the control, as onFieldValueChange expects IFormControl
      this.onFieldValueChange(control.formConfig, false);
    });

    // Disable controls based on IsTravelRaiseRequest flag
    if (rowData.row?.IsTravelRaiseRequest) {
      this.isTravelRaiseRequest = true;
      this.freezeControlsBasedOnConditions();
    }
    this.dynamicFormService.updateConditionalValidators(this.form, this.formConfig);
    this.scrollToFirstInvalidControl();
  }

  clear() {
    this.isClearing = true;
    this.form.reset();
    // enable all controls
    this.form.enable();
    this.isTravelRaiseRequest = false; // Reset flag after validation
    this.editIndex = 0;
    this.dateInputComponentRef.forEach((dateInput: DateInputComponent) => {
      dateInput.timeControl.reset();
      dateInput.timeControl.enable();
    });
    this.costCenterComponentRef?.setMultipleCostCenterFlag(false);
    if (this.costCenterComponentRef) {
      this.costCenterComponentRef.costCenterData = [];
    }
    this.gstComponentRef?.setCompanyGSTFlag(false);
    if (this.gstComponentRef) {
      this.gstComponentRef.gstData = [];
    }
    if (this.quotationComponentRef) {
      this.quotationComponentRef.quotationData = [];
    }
    this.selectedFiles = [];
    this.formControls?.forEach((control: any) => {
      if (control.formConfig?.defaultValue) {
        control.control.setValue(control.formConfig.defaultValue?.Id, { emitEvent: false });
      }
    });
    setTimeout(() => {
      this.isClearing = false;
    }, 500);
  }

  getInputValue(input: any) {
    this.emitTextData.emit(input);
  }

  validatePolicyViolation() {
    let confirmPopupData: any = {};
    if (this.category.policyViolationCheckApi) {
      const service = this.serviceRegistry.getService(this.category.policyViolationCheckApi.apiService);
      const apiMethod = this.category.policyViolationCheckApi.apiMethod;
      let requestBody: any = this.category.policyViolationCheckApi.requestBody;

      Object.entries(this.category.policyViolationCheckApi.inputControls).forEach(([controlName, requestKey]) => {
        if (typeof requestKey === 'string') { // Ensure requestKey is a string
          const controlValue = this.form.get(controlName)?.value;
          requestBody[requestKey] = controlValue; // Extract Id if it's an object
        }
      });

      const output = this.mapOtherControls(this.moduleData, this.category.policyViolationCheckApi.otherControls);

      service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
        (response: any) => {
          if (response?.ResponseValue) {
            if (typeof this.category.policyViolationCheckApi.outputControl === 'object') {
              // Multiple fields case
              for (const [outputControl, responsePath] of Object.entries(this.category.policyViolationCheckApi.outputControl) as [string, string][]) {
                const value = this.extractValueFromPath(response, responsePath);
                if (value !== undefined) {
                  this.form.get(outputControl)?.setValue(value);
                }
              }
            }
            if (typeof this.category.policyViolationCheckApi.confirmPopup === 'object') {
              // Multiple fields case
              for (const [confirmPopup, responsePath] of Object.entries(this.category.policyViolationCheckApi.confirmPopup) as [string, string][]) {
                const value = this.extractValueFromPath(response, responsePath);
                if (value !== undefined) {
                  confirmPopupData[confirmPopup] = value;
                } else {
                  confirmPopupData[confirmPopup] = responsePath;
                }
              }
            }
            if (this.form.value.IsViolation) {
              this.confirmDialogService
                .confirm(confirmPopupData)
                .subscribe((confirmed) => {
                  if (confirmed) {
                    if (this.category?.policyViolationManualCheck) {
                      this.validateManualPolicyViolation();
                    } else {
                      this.proceedWithSubmission();
                    }
                  }
                });
            } else {
              if (this.category?.policyViolationManualCheck) {
                this.validateManualPolicyViolation();
              } else {
                this.proceedWithSubmission();
              }
            }
          }
        });
    } else if (this.category?.policyViolationManualCheck) {
      // If only manual checks are defined, validate them
      this.validateManualPolicyViolation();
    } else {
      // No policy violation checks defined, proceed with submission
      this.proceedWithSubmission();
    }
  }

  onFieldValueChange(control: IFormControl, skipPolicyViolationCheck?: boolean) {
    skipPolicyViolationCheck = skipPolicyViolationCheck ?? true;
    // Prevent auto-calculation on clear/reset
    if (this.isClearing) return;

    if (control.conditionBasedDisplayFieldsCheck) {
      setTimeout(() => {
        this.dynamicFormService.checkConditionBasedDisplayFields(control, this.category, this.form, this.formConfig, this.moduleData);
      }, 500);
    }

    if (control.policyEntitlementCheck) {
      setTimeout(() => {
        this.dynamicFormService.validateFieldPolicyEntitlement(control, this.category, this.form, this.formConfig, this.moduleData);
      }, 500);
    }

    if (control.policyViolationCheck && skipPolicyViolationCheck) {
      setTimeout(() => {
        this.dynamicFormService.validateFieldPolicyViolation(control, this.category, this.form, this.formConfig, this.moduleData);
      }, 500);
    }
    if (control.EntitlementAmountCalculation) {
      this.dynamicFormService.calculateEntitlementAmount(control, this.form);
    }
    if (control.taxCalculation) {
      this.dynamicFormService.calculateDifferentialAmount(control, this.form);
    }

    setTimeout(() => {
      if (control.setValue) {
        control.setValue.forEach((field: any) => {
          // Handle minDate from another control (like direct copy)
          if (field.config.minDate) {
            this.dateInputComponentRef.forEach((dateInput: DateInputComponent) => {
              if (dateInput.controlConfig.name === field.name) {
                dateInput.minDate = this.form.get(field.config.minDate)?.value;
              }
            });
          }

          // Handle custom dateRange config like: { dateRange: "Month" }
          if (field.config.dateRange) {
            const monthControlValue = this.form.get(field.config.dateRange)?.value;

            if (monthControlValue) {
              const parsedMonth = _moment(monthControlValue, 'MMM-YYYY');

              if (parsedMonth.isValid()) {
                const minDate = parsedMonth.startOf('month').toDate();
                const maxDate = parsedMonth.endOf('month').toDate();

                this.dateInputComponentRef.forEach((dateInput: DateInputComponent) => {
                  if (dateInput.controlConfig.name === field.name) {
                    dateInput.minDate = minDate;
                    dateInput.maxDate = maxDate;

                    // Optional: reset control value if out of new range
                    const currentVal = dateInput.control.value;
                    if (currentVal) {
                      const currentDate = new Date(currentVal);
                      if (currentDate < minDate || currentDate > maxDate) {
                        dateInput.control.setValue(null);
                      }
                    }
                  }
                });
              }
            }
          }
        });
      }

      if (control.setFields) {
        control.setFields.forEach((field: any) => {
          // Prepare values for formula
          const checkFormula = field.checkFormula || '';
          if (checkFormula) {
            const values: any = {};
            field.dependsOn?.forEach((dep: string) => {
              values[dep] = this.form.get(dep)?.value;
            });
            const isFormulaValid = this.dynamicFormService.evaluateFormula(checkFormula, values);
            if (!isFormulaValid)
              return; // Skip if checkFormula is false
          }
          const dependsOn = field.dependsOn || [];
          const values: any = {};
          dependsOn.forEach((dep: string) => {
            values[dep] = this.form.get(dep)?.value;
          });

          // 1. Calculate the field value
          const calculatedValue = this.dynamicFormService.evaluateFormula(field.formula, values);

          // 2. Set value
          this.form.get(field.name)?.setValue(calculatedValue < 0 ? 0 : calculatedValue);

          // 3. Check for setValidations
          if (field.setValidations && field.setValidations.length > 0) {
            field.setValidations.forEach((validation: any) => {
              if (validation.type === 'max') {
                // Calculate the dynamic max
                const maxDependsOn = validation.calculateValue.dependsOn || [];
                const maxValues: any = {};
                maxDependsOn.forEach((dep: string) => {
                  maxValues[dep] = this.form.get(dep)?.value;
                });

                const maxValue = this.dynamicFormService.evaluateFormula(
                  validation.calculateValue.formula,
                  maxValues
                );

                // Update the validator
                const controlToValidate = this.form.get(field.name);
                controlToValidate?.setValidators([
                  Validators.max(maxValue)
                ]);
                this.formConfig.forEach((config: any) => {
                  if (field.name === config.name) {
                    config.validations.push({
                      type: 'max',
                      value: maxValue,
                      message: `${field?.label} cannot exceed ${maxValue}.`
                    })
                  }
                });
                controlToValidate?.updateValueAndValidity();
              }
            });
          }
        });
      }
    }, 500); // Allow time for async validators to complete

  }

  mapOtherControls(data: any, otherControls: Record<string, string>): Record<string, any> {
    const mappedResult: Record<string, any> = {};

    for (const [outputKey, sourceKey] of Object.entries(otherControls)) {
      mappedResult[outputKey] = data[sourceKey] ?? null; // fallback to null if key not found
    }

    return mappedResult;
  }

  /**
   * Extracts a nested value from an object using a dot-separated path.
   * Example: extractValueFromPath({ ResponseValue: { Value: 1 } }, "ResponseValue.Value") => 1
   */
  private extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  onDeleteRow(index: number) {
    this.tableData.splice(index, 1);
    this.existingData.splice(index, 1);
    this.tableData = [...this.tableData];
    this.existingData = [...this.existingData];

    this.category.count = this.tableData.length; // To update tab badge

    this.updateData.emit({ name: this.category.name, data: this.tableData }); // Emit to parent if needed
  }

  onOcrCompleted(ocrData: any) {

    // Set IsBillRaisedInCompanyGST to true
    if (this.gstComponentRef && this.gstComponentRef.companyGSTForm) {
      if (ocrData.IsGSTApplicable) {
        this.gstComponentRef.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(true);
      }
    }
    // Set gstDetails in AddGstComponent via GstComponent
    if (this.gstComponentRef && ocrData?.gst) {
      this.gstComponentRef.setGstDetailsFromOcr(ocrData.gst);
    }
  }

  handleBusinessCase(businessCaseData: any) {
    this.dynamicFormService.handleBusinessCase(businessCaseData, this.form, this.moduleData);
  }

  // Add this method to clear options for other autocomplete controls
  onAutoCompleteFocus(focusedControlConfig: IFormControl) {

    this.formControls.forEach(({ formConfig }) => {
      if (
        formConfig.autoComplete &&
        formConfig.name !== focusedControlConfig.name &&
        Array.isArray(formConfig.options)
      ) {
        formConfig.options = [];
      }
    });
  }

  private scrollToFirstInvalidControl(): void {
    // Wait for the next animation frame to ensure DOM updates
    requestAnimationFrame(() => {
      // Broader selector to include various invalid controls
      const invalidControl = document.querySelector(
        '.ng-invalid[formcontrolname], .ng-invalid[ng-reflect-name], .ng-invalid input'
      ) as HTMLElement | null;

      if (invalidControl) {
        // Scroll to the element
        invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Focus the control only if it's focusable
        if (invalidControl.tabIndex >= 0 || invalidControl.tagName.match(/INPUT|TEXTAREA|SELECT/)) {
          invalidControl.focus();
        }

        // Optional: Announce to screen readers
        invalidControl.setAttribute('aria-live', 'polite');
        invalidControl.setAttribute('aria-describedby', 'error-message');
      }
    });
  }

  freezeControlsBasedOnConditions(): void {
    this.category.freezFormControls?.forEach((controlConfig: any) => {
      const control = this.form.get(controlConfig.name);

      // If valueCheck is enabled, apply conditional logic based on value and type
      if (controlConfig?.valueCheck) {
        const value = control?.value;

        if (value) {
          if (controlConfig?.type === 'number') {
            if (Number(value) === 0) {
              control?.enable({ emitEvent: false });

              // Remove all controls from freezFormControls
              this.category.freezFormControls = this.category.freezFormControls?.filter(
                (item: any) => item.name !== controlConfig.name
              );
            } else {
              control?.disable({ emitEvent: false });
            }
          }
        } else {
          control?.enable({ emitEvent: false });
        }
      } else {
        // Handle datetime controls - disable their associated time control
        if (controlConfig?.type === 'datetime' && this.dateInputComponentRef) {
          this.dateInputComponentRef.forEach((dateInput: DateInputComponent) => {
            if (
              dateInput.controlConfig.name === controlConfig.name &&
              dateInput.timeControl
            ) {
              dateInput.timeControl.disable({ emitEvent: false });
            }
          });
        }

        control?.disable({ emitEvent: false });
      }
    });
  }

}
