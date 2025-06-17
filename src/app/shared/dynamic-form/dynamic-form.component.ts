import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl } from './form-control.interface';

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
    CostCenterComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})

export class DynamicFormComponent implements OnInit, OnChanges {
  @ViewChild(CostCenterComponent) costCenterComponentRef!: CostCenterComponent;
  @ViewChild(GstComponent) gstComponentRef!: GstComponent;
  @Input() moduleData: any;
  @Input() category: any;
  @Input() formConfig: IFormControl[] = [];
  @Input() eventHandler: any;
  @Input() existingData: any;
  @Output() emitFormData = new EventEmitter<any>();
  @Output() emitTextData = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();
  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  tableData: any = [];
  selectedRow: any;
  formData: any = {};
  editIndex = 0;
  referenceId = 0;
  isValid = true;
  selectedFiles: any = [];

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private confirmDialogService: ConfirmDialogService,
    private configService: GlobalConfigService,
    private snackbarService: SnackbarService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingData'] && this.existingData?.length) {
      this.prepareOptions(this.existingData).then(() => {
        this.populateTableData(this.existingData);
      });
    }
  }

  private async prepareOptions(dataArray: any[]): Promise<void> {
    const controlLoaders: Promise<void>[] = [];

    this.formConfig
      .filter(ctrl => (ctrl.payloadKey) && ctrl.apiService && ctrl.apiMethod)
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

  private async populateTableData(dataArray: any[]) {
    const updatedDataArray = await Promise.all(
      dataArray.map(async (data) => {
        for (const control of this.formControls) {
          const { type, name, autoComplete, options, apiService, apiMethod, dependsOn, payloadKey, labelKey, valueKey } = control.formConfig;

          if ((type === 'select') && name in data) {
            let selected = data[name];
            if (selected && typeof selected === 'object') {
              selected = selected.value;
            }

            // For dependent dropdowns: fetch options if not present
            if ((!options || options.length === 0) && apiService && apiMethod && dependsOn) {
              const dependsOnValue = data[dependsOn];
              const payload = { [payloadKey || 'id']: dependsOnValue?.value || dependsOnValue };

              const service = this.serviceRegistry.getService(apiService);
              if (service && typeof service[apiMethod] === 'function') {
                const response = await service[apiMethod](payload).toPromise();
                const resultOptions = response?.ResponseValue?.map((item: any) => ({
                  label: item[labelKey || 'label'],
                  value: item[valueKey || 'value']
                })) || [];
                control.formConfig.options = resultOptions;
              }
            }

            const matchedOption = control.formConfig.options?.find(opt => opt.value === selected);
            if (matchedOption) {
              data[name] = matchedOption;
            }
          }

          if (autoComplete && name in data) {
            let selected = data[name];
            if ((!options || options.length === 0) && apiService && apiMethod) {
              const requestBody = [
                {
                  id: selected,
                  name: "",
                  masterName: "City"
                }
              ];
              const service = this.serviceRegistry.getService(apiService);
              service[apiMethod](requestBody).subscribe({
                next: (response: any) => {
                  if (response) {
                    response = response?.map((item: any) => ({
                      CityMasterId: item.id,
                      City: item.name
                    }));
                    if (labelKey && valueKey) {
                      control.formConfig.options = response.filter((r: any) => r[valueKey] == selected);
                      control.formConfig.options = control.formConfig.options?.map((item: any) => ({
                        label: item[labelKey],
                        value: item[valueKey]
                      }));
                      const matchedOption = control.formConfig.options?.find(opt => opt.value === selected);
                      if (matchedOption) {
                        data[name] = matchedOption;
                      }
                    }
                  }
                }
              });
            }
          }
        }

        return data;
      })
    );

    this.tableData = updatedDataArray;
  }

  ngOnInit() {

    this.formControls = []; // Reset to avoid duplication
    this.form = new FormGroup({});
    this.formConfig.forEach(config => {
      if (config.dataType === 'numeric') {
        this.setupAutoFormat(config, this.configService);
      }
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
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
    this.updateConditionalValidators();
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
    debugger;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
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
        return;
      }

      // Check for duplicate in DB:
      // - On create (editIndex === 0)
      // - On edit if OCRLogId is a number (user changed/uploaded bill)
      let shouldCheckDuplicate = this.editIndex === 0 || (this.editIndex > 0 && typeof this.form.value.OCRLogId === 'number');
      if (shouldCheckDuplicate) {
        let isDuplicate = await this.checkOCRDuplicate();
        if (isDuplicate) {
          this.snackbarService.success('Duplicate OCR entry detected. Please check your Bill Number, Date, Amount, or Vendor Name.', 1000000)
          return;
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
        return;
      }
    }

    if (this.existingData?.length > 0) {
      const checkInDateTime = this.form.value?.CheckInDateTime;
      const checkOutDateTime = this.form.value?.CheckOutDateTime;

      if (checkInDateTime && checkOutDateTime) {
        const isConflict = this.existingData.some((row: any) => {
          const existingCheckIn = row.CheckInDateTime;
          const existingCheckOut = row.CheckOutDateTime;
          return (new Date(checkInDateTime) < new Date(existingCheckOut)) && (new Date(checkOutDateTime) > new Date(existingCheckIn));
        });

        if (isConflict) {
          this.snackbarService.error('Check-in and check-out times conflict with existing entries. Please adjust your dates.', 5000);
          return;
        }
      }
    } 
    this.validatePolicyViolation();
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
      let fieldValue = this.form.value[fieldName];

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
        this.formData.data.excludedData[fieldName] = fieldValue ?? null;
      } else {
        this.formData.data[fieldName] = fieldValue ?? null;
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
    if (rowData.row?.costcentreWiseExpense?.length > 0) {
      this.costCenterComponentRef.setMultipleCostCenterFlag(true);
      this.costCenterComponentRef.costCenterData = rowData.row?.costcentreWiseExpense;
    }
    if (rowData.row?.gst?.length > 0) {
      this.gstComponentRef.setCompanyGSTFlag(true);
      this.gstComponentRef.gstData = rowData.row?.gst;
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
      } else {
        this.form.controls[name].setValue(value);
      }
    });
  }

  clear() {
    this.form.reset();
    this.costCenterComponentRef.setMultipleCostCenterFlag(false);
    this.costCenterComponentRef.costCenterData = [];
    this.gstComponentRef.setCompanyGSTFlag(false);
    this.gstComponentRef.gstData = [];
    this.selectedFiles = [];
    this.formControls?.forEach((control: any) => {
      if (control.formConfig?.defaultValue) {
        control.control.setValue(control.formConfig.defaultValue?.Id);
      }
    })
  }

  getInputValue(input: any) {
    this.emitTextData.emit(input);
  }

  getSpecificCase(specificCaseData: any) {
  }

  validatePolicyViolation() {
    let confirmPopupData: any = {};
    if (this.category.submitPolicyValidationApi) {
      const service = this.serviceRegistry.getService(this.category.submitPolicyValidationApi.apiService);
      const apiMethod = this.category.submitPolicyValidationApi.apiMethod;
      let requestBody: any = this.category.submitPolicyValidationApi.requestBody;

      Object.entries(this.category.submitPolicyValidationApi.inputControls).forEach(([controlName, requestKey]) => {
        if (typeof requestKey === 'string') { // Ensure requestKey is a string
          const controlValue = this.form.get(controlName)?.value;
          requestBody[requestKey] = controlValue; // Extract Id if it's an object
        }
      });

      const output = this.mapOtherControls(this.moduleData, this.category.submitPolicyValidationApi.otherControls);

      service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
        (response: any) => {
          if (typeof this.category.submitPolicyValidationApi.outputControl === 'object') {
            // Multiple fields case
            for (const [outputControl, responsePath] of Object.entries(this.category.submitPolicyValidationApi.outputControl) as [string, string][]) {
              const value = this.extractValueFromPath(response, responsePath);
              if (value !== undefined) {
                this.form.get(outputControl)?.setValue(value, { emitEvent: false });
              }
            }
          }
          if (typeof this.category.submitPolicyValidationApi.confirmPopup === 'object') {
            // Multiple fields case
            for (const [confirmPopup, responsePath] of Object.entries(this.category.submitPolicyValidationApi.confirmPopup) as [string, string][]) {
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
                  this.setCalculatedFields();
                  this.setAutoCompleteFields();
                  this.prepareFormJson();
                  this.addDataToDynamicTable();
                  setTimeout(() => {
                    this.clear();
                  }, 500);
                }
              });
          } else {
            this.setCalculatedFields();
            this.setAutoCompleteFields();
            this.prepareFormJson();
            this.addDataToDynamicTable();
            setTimeout(() => {
              this.clear();
            }, 500);
          }
        });
    } else {
      this.setCalculatedFields();
      this.setAutoCompleteFields();
      this.prepareFormJson();
      this.addDataToDynamicTable();
      setTimeout(() => {
        this.clear();
      }, 500);
    }
  }

  validateFieldPolicyViolation(control: IFormControl) {
    let confirmPopupData: any = {};
    if (!control.policyViolationCheck) return;

    const service = this.serviceRegistry.getService(this.category.submitPolicyValidationApi.apiService);
    const apiMethod = this.category.submitPolicyValidationApi.apiMethod;
    let requestBody: any = this.category.submitPolicyValidationApi.requestBody;

    Object.entries(this.category.submitPolicyValidationApi.inputControls).forEach(([controlName, requestKey]) => {
      if (typeof requestKey === 'string') { // Ensure requestKey is a string
        const controlValue = this.form.get(controlName)?.value;
        requestBody[requestKey] = controlValue; // Extract Id if it's an object
      }
    });

    const output = this.mapOtherControls(this.moduleData, this.category.submitPolicyValidationApi.otherControls);

    service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
      (response: any) => {
        if (typeof this.category.submitPolicyValidationApi.outputControl === 'object') {
          // Multiple fields case
          for (const [outputControl, responsePath] of Object.entries(this.category.submitPolicyValidationApi.outputControl) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              this.form.get(outputControl)?.setValue(value, { emitEvent: false });
            }
          }
        }
        if (typeof this.category.submitPolicyValidationApi.confirmPopup === 'object') {
          // Multiple fields case
          for (const [confirmPopup, responsePath] of Object.entries(this.category.submitPolicyValidationApi.confirmPopup) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              confirmPopupData[confirmPopup] = value;
            } else {
              confirmPopupData[confirmPopup] = responsePath;
            }
          }
        }

        if (this.form.value.IsViolation) {
          confirmPopupData.cancelButton = false;
          this.confirmDialogService.confirm(confirmPopupData).subscribe();
        }
        this.updateConditionalValidators();
      });
  }

  onFieldValueChange(control: IFormControl) {
    if (control.policyViolationCheck) {
      this.validateFieldPolicyViolation(control);
    }
    // ...existing logic for value change...
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

  updateConditionalValidators() {
    this.formConfig.forEach(config => {
      if (config.requiredIf) {
        const control = this.form.get(config.name);
        let isRequired = false;

        Object.entries(config.requiredIf).forEach(([field, expectedValues]) => {
          const value = this.form.get(field)?.value;
          const actualValue = typeof value === 'object' ? value?.value : value;
          if (Array.isArray(expectedValues) && expectedValues.includes(actualValue)) {
            isRequired = true;
          }
          // Support for boolean requiredIf (e.g., { IsViolation: true })
          if (!Array.isArray(expectedValues) && actualValue === expectedValues) {
            isRequired = true;
          }
        });

        if (isRequired) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      }
    });
  }

  setCalculatedFields() {
    this.formControls.forEach(control => {
      const calculateConfig = control.formConfig.calculate;
      if (!calculateConfig) return;

      const { formula, dependsOn } = calculateConfig;
      if (!formula || !dependsOn?.length) return;

      const values: Record<string, number> = {};

      dependsOn.forEach((depName: any) => {
        const rawValue = this.form.get(depName)?.value;
        const numeric = typeof rawValue === 'object' ? rawValue?.value ?? 0 : rawValue;
        values[depName] = parseFloat(numeric ?? 0);
      });

      const calculatedValue = this.safeEvaluateFormula(formula, values);
      this.form.get(control.formConfig.name)?.setValue(calculatedValue.toFixed(this.configService.getDecimalPrecision()), { emitEvent: false });
    });
  }


  private safeEvaluateFormula(formula: string, values: Record<string, number>): number {
    try {
      const keys = Object.keys(values);
      const vals = Object.values(values);
      const fn = new Function(...keys, `return ${formula};`);
      return fn(...vals);
    } catch (e) {
      console.warn('Formula evaluation error:', e);
      return 0;
    }
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
}
