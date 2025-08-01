import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ServiceRegistryService } from './service-registry.service';
import { IFormControl } from '../dynamic-form/form-control.interface';
import { ConfirmDialogService } from './confirm-dialog.service';
import { GlobalConfigService } from './global-config.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private confirmDialogService: ConfirmDialogService,
    private configService: GlobalConfigService,
    private snackbarService: SnackbarService
  ) { }


  scrollToFirstInvalidControl(querySelector: string): void {
    const firstInvalidControl: HTMLElement | null = document.querySelector(`${querySelector} .ng-invalid`);
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidControl.focus?.(); // optional
    }
  }


  setCalculatedFields(form: any, formControls: any[]): void {
    formControls.forEach(control => {
      const calculateConfig = control.formConfig.calculate;
      if (!calculateConfig) return;

      const { formula, dependsOn } = calculateConfig;
      if (!formula || !dependsOn?.length) return;

      const values: Record<string, number> = {};

      dependsOn.forEach((depName: any) => {
        const rawValue = form.get(depName)?.value;
        const numeric = typeof rawValue === 'object' ? rawValue?.value ?? 0 : rawValue;
        values[depName] = parseFloat(numeric ?? 0);
      });

      const calculatedValue = this.safeEvaluateFormula(formula, values);
      form.get(control.formConfig.name)?.setValue(calculatedValue.toFixed(this.configService.getDecimalPrecision()));
    });
  }

  safeEvaluateFormula(formula: string, values: Record<string, number>): number {
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

  validateFieldPolicyEntitlement(control: IFormControl, category: any, form: any, formControls: any[], moduleData: any): void {
    if (!control.policyEntitlementCheck) return;

    const service = this.serviceRegistry.getService(category.policyEntitlementCheckApi.apiService);
    const apiMethod = category.policyEntitlementCheckApi.apiMethod;
    let requestBody: any = category.policyEntitlementCheckApi.requestBody;

    Object.entries(category.policyEntitlementCheckApi.inputControls).forEach(([controlName, requestKey]) => {
      if (typeof requestKey === 'string') { // Ensure requestKey is a string
        const controlValue = form.get(controlName)?.value;
        requestBody[requestKey] = controlValue; // Extract Id if it's an object
      }
    });

    const output = this.mapOtherControls(moduleData, category.policyEntitlementCheckApi.otherControls);

    console.log('Policy Entitlement Check Request Body:', requestBody);
    console.log('Policy Entitlement Check Output:', output);
    // if any value of requestBody is null the return
    if (Object.values(requestBody).some(value => value === null)) {
      return;
    }

    // if any value of output is null the return
    if (Object.values(output).some(value => value === null)) {
      return;
    }

    service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
      (response: any) => {
        console.log('Policy Entitlement Check Response:', response);
        if (!response?.ResponseValue) {
          this.snackbarService.error('No Policy Entitlement is available. Please contact your administrator.');
          return;
        }
        if (typeof category.policyEntitlementCheckApi.outputControl === 'object') {
          // Multiple fields case
          for (const [outputControl, responsePath] of Object.entries(category.policyEntitlementCheckApi.outputControl) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              form.get(outputControl)?.setValue(value);
            }
          }
        }
        if (response?.ResponseValue?.ExpensePolicyEntitlementMetaData?.length > 0) {
          const metaDataMap = category.policyEntitlementCheckApi.metaData || {};

          response?.ResponseValue.ExpensePolicyEntitlementMetaData.forEach((meta: any) => {
            // Find the matching control name by comparing meta.FieldName with metaDataMap values
            const matchedControlName = Object.keys(metaDataMap).find(
              (controlName) => metaDataMap[controlName] === meta.FieldName
            );

            if (matchedControlName) {
              let value: any;

              // Extract value based on DataTypeId or DataType
              if (meta.DataType === 'NumericValue' || meta.DataTypeId === 71) {
                value = meta.NumericValue;
              } else if (meta.DataType === 'IntegerValue' || meta.DataTypeId === 70) {
                value = meta.IntegerValue;
              } else if (meta.DataType === 'DatetimeValue' || meta.DataTypeId === 69) {
                value = meta.DatetimeValue;
              } else if (meta.DataType === 'BitValue') {
                value = meta.BitValue;
              } else if (meta.DataType === 'VarcharValue') {
                value = meta.VarcharValue;
              } else {
                console.warn(`Unsupported DataType for field "${meta.FieldName}"`);
              }

              // If we got a value, set it
              if (value !== undefined) {
                const formControl = form.get(matchedControlName);
                if (formControl) {
                  formControl.setValue(value);
                } else {
                  console.warn(`Form control "${matchedControlName}" not found`);
                }
              }
            }
          });
        }

        if (form.value.IsActual) {
          const fieldsToRemove = [
            'EntitlementCurrency',
            'EntitlementAmount',
            'EntitlementConversionRate',
            'DifferentialAmount'
          ];

          fieldsToRemove.forEach(field => {
            form.removeControl(field);
            const control = formControls.find(c => c.formConfig?.name === field);
            if (control) {
              control.formConfig.showInUI = false;
            }
          });


          // IsKmLimitRequired bit value is true, display AmountPerKM
          const isKmLimitRequired = form.get('IsKmLimitRequired')?.value;
          if (isKmLimitRequired) {
            const amountPerKMControl = formControls.find(c => c.name === 'AmountPerKM');
            if (amountPerKMControl) {
              form.addControl('AmountPerKM', amountPerKMControl);
              amountPerKMControl.showInUI = true;
            }
          }



          // disable KM field if MaximumAmount is present
          const kmControl = form.get('KM');
          if (kmControl) {
            const maximumAmountControl = form.get('MaximumAmount');
            if (maximumAmountControl && maximumAmountControl.value) {
              kmControl.disable();
            } else {
              kmControl.enable();
            }
          }
        } else {
          // If IsActual is false, ensure the entitlement fields are present
          const entitlementFields = [
            'EntitlementCurrency',
            'EntitlementAmount',
            'EntitlementConversionRate',
            'DifferentialAmount'
          ];

          entitlementFields.forEach((field: any) => {
            if (!form.get(field)) {
              const entitlementControlConfig = formControls.find(c => c.formConfig?.name === field);
              if (entitlementControlConfig) {
                form.addControl(field, entitlementControlConfig.formConfig.control);
              }
              const controlConfig = formControls.find(c => c.formConfig?.name === field);
              if (controlConfig) {
                controlConfig.formConfig.showInUI = true;
              }
            }
          });
          // enable KM field
          const kmControl = form.get('KM');
          if (kmControl) {
            kmControl.enable();
          }
        }
        this.updateConditionalValidators(form, formControls);
      });
  }

  validateFieldPolicyViolation(control: IFormControl, category: any, form: any, formConfig: any[], moduleData: any): void {
    let confirmPopupData: any = {};
    if (!control.policyViolationCheck) return;

    const service = this.serviceRegistry.getService(category.policyViolationCheckApi.apiService);
    const apiMethod = category.policyViolationCheckApi.apiMethod;
    let requestBody: any = category.policyViolationCheckApi.requestBody;

    Object.entries(category.policyViolationCheckApi.inputControls).forEach(([controlName, requestKey]) => {
      if (typeof requestKey === 'string') { // Ensure requestKey is a string
        const controlValue = form.get(controlName)?.value;
        requestBody[requestKey] = controlValue; // Extract Id if it's an object
      }
    });

    const output = this.mapOtherControls(moduleData, category.policyViolationCheckApi.otherControls);

    service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
      (response: any) => {
        if (typeof category.policyViolationCheckApi.outputControl === 'object') {
          // Multiple fields case
          for (const [outputControl, responsePath] of Object.entries(category.policyViolationCheckApi.outputControl) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              form.get(outputControl)?.setValue(value);
            }
          }
        }
        if (typeof category.policyViolationCheckApi.confirmPopup === 'object') {
          // Multiple fields case
          for (const [confirmPopup, responsePath] of Object.entries(category.policyViolationCheckApi.confirmPopup) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              confirmPopupData[confirmPopup] = value;
            } else {
              confirmPopupData[confirmPopup] = responsePath;
            }
          }
        }

        if (form.value.IsViolation) {
          confirmPopupData.cancelButton = false;
          this.confirmDialogService.confirm(confirmPopupData).subscribe();
        }

        this.updateConditionalValidators(form, formConfig);
      });
  }

  mapOtherControls(data: any, otherControls: Record<string, string>, landingBoxData?: any): Record<string, any> {
    const mappedResult: Record<string, any> = {};

    for (const [outputKey, sourceKey] of Object.entries(otherControls)) {
      if (data) {
        // If data is available, use it
        const value = (data && data[sourceKey] !== undefined) ? data[sourceKey] : null;
        mappedResult[outputKey] = value;
      } else if (landingBoxData && landingBoxData[sourceKey] !== undefined) {
        // If data is not available, check landingBoxData
        const value = landingBoxData[sourceKey] !== undefined ? landingBoxData[sourceKey] : null;
        mappedResult[outputKey] = value;
        continue;
      } else {
        // If neither data nor landingBoxData has the key, set it to null
        mappedResult[outputKey] = null;
      }
    }

    return mappedResult;
  }

  private extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  updateConditionalValidators(form: any, formConfig: any[]): void {
    formConfig.forEach(config => {
      if (config.requiredIf) {
        const control = form.get(config.name);
        let isRequired = false;

        Object.entries(config.requiredIf).forEach(([field, expectedValues]) => {
          const value = form.get(field)?.value;
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

  calculateDifferentialAmount(control: IFormControl, form: any): void {
    const config = control.taxCalculation;

    const claimAmount = parseFloat(form.get(config.inputControls.ClaimAmountInBaseCurrency)?.value || 0);
    const entitlementAmount = parseFloat(form.get(config.inputControls.EntitlementAmountInBaseCurrency)?.value || 0);
    const taxAmount = parseFloat(form.get(control.name)?.value || 0); // control.name is "TaxAmount"
    const outputControlName = Object.keys(config.outputControl)[0];

    let differentialAmount = 0;

    if (config.IsTaxExclusive) {
      differentialAmount = entitlementAmount - claimAmount;
    } else {
      differentialAmount = entitlementAmount - (claimAmount + taxAmount);
    }

    if (differentialAmount < 0) {
      differentialAmount = Math.abs(differentialAmount);
      form.get(outputControlName)?.setValue(differentialAmount);
      form.get('IsViolation')?.setValue(true);
    } else {
      const precision = this.configService.getDecimalPrecision();
      form.get(outputControlName)?.setValue((0).toFixed(precision));
      form.get('IsViolation')?.setValue(false);
    }
  }

  calculateEntitlementAmount(control: IFormControl, form: any): void {
    const config = control.EntitlementAmountCalculation;
    if (!config) return;

    const checkInDate = form.get(config.inputControls.CheckInDateTime)?.value;
    const checkOutDate = form.get(config.inputControls.CheckOutDateTime)?.value;
    const originalEntitlementAmount = parseFloat(form.get(config.inputControls.OriginalEntitlementAmount)?.value || 0);

    if (checkInDate && checkOutDate && originalEntitlementAmount) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Calculate number of days

      const entitlementAmount = originalEntitlementAmount * diffDays;
      const outputFieldName = Object.keys(config.outputControl)[0];

      form.get(outputFieldName)?.setValue(entitlementAmount.toFixed(this.configService.getDecimalPrecision()));
    }
  }


  handleBusinessCase(businessCaseData: any, form: any, moduleData: any): void {
    if (!businessCaseData.apiService || !businessCaseData.apiMethod) return;

    let apiSubscription: Subscription;
    const apiService = this.serviceRegistry.getService(businessCaseData.apiService);

    if (apiService && typeof apiService[businessCaseData.apiMethod] === "function") {
      // Dynamically populate request body from input controls
      let requestBody: any = businessCaseData.requestBody;
      let shouldMakeApiCall = true;
      Object.entries(businessCaseData.inputControls).forEach(([controlName, requestKey]) => {
        if (typeof requestKey === 'string') { // Ensure requestKey is a string
          let controlValue = form.get(controlName)?.value;
          if (typeof controlValue === 'object' && controlValue !== null) {
            controlValue = controlValue.value ?? controlValue; // Handle case where controlValue is an object
          }
          if (!controlValue) {
            this.snackbarService.error(`Please Select a ${controlName}.`);
            shouldMakeApiCall = false;
          } else {
            requestBody[requestKey] = controlValue[businessCaseData.key] ?? controlValue; // Extract Id if it's an object
          }
        }
      });
      // Handle other controls if they exist
      if (businessCaseData?.otherControls) {
        const output = this.mapOtherControls(moduleData, businessCaseData.otherControls, businessCaseData?.landingBoxData);
        requestBody = { ...requestBody, ...output };
      }

      if (shouldMakeApiCall) {
        apiSubscription = apiService[businessCaseData.apiMethod](requestBody).subscribe(
          (response: any) => {
            // Dynamically set output controls based on response mapping
            if (typeof businessCaseData.outputControl === 'string') {
              // Single field case
              const value = this.extractValueFromPath(response, businessCaseData.outputControl);
              if (value !== undefined) {
                form.get(businessCaseData.outputControl)?.setValue(value);
              }
            } else if (typeof businessCaseData.outputControl === 'object') {
              // Multiple fields case
              for (const [outputControl, responsePath] of Object.entries(businessCaseData.outputControl) as [string, string][]) {
                const value = this.extractValueFromPath(response, responsePath);
                if (value !== undefined) {
                  if (businessCaseData.autoFormat?.decimal) {
                    form.get(outputControl)?.setValue(`${value}${businessCaseData.autoFormat.decimal}`);
                  } else {
                    form.get(outputControl)?.setValue(value);
                  }
                }
              }
            }
          },
          (error: any) => {
            console.error("API Error:", error);
          }
        );
      }

    } else {
      console.warn(`Invalid API service or method: ${businessCaseData.apiService}.${businessCaseData.apiMethod}`);
    }
  }

  getFormConfig(formConfig: IFormControl[], moduleConfig: any): IFormControl[] {
    console.log(moduleConfig);
    let modifiedFormConfig = [...formConfig]; // Create a copy of the original formConfig
    // handle international data
    if (moduleConfig?.internationalFlag) {
      modifiedFormConfig.forEach((control: IFormControl) => {
        if (control.international === false) {
          // remove control if international is false
          const index = modifiedFormConfig.indexOf(control);
          if (index > -1) {
            modifiedFormConfig.splice(index, 1);
          }
        }

        if (control?.dependentCases?.length > 0) {
          control.dependentCases.forEach((caseConfig: any) => {
            if (caseConfig?.type?.includes('international')) {
              // If the case type includes 'international', ensure the control is included
              if (!modifiedFormConfig.includes(control)) {
                modifiedFormConfig.push(control);
              }
            }
          });
        }
      });
    } else {
      for (let i = modifiedFormConfig.length - 1; i >= 0; i--) {
        if (modifiedFormConfig[i].international === true) {
          modifiedFormConfig.splice(i, 1);
        }
      }
    }

    // Handle displayPage filtering
    modifiedFormConfig = modifiedFormConfig.filter(control => {
      if (typeof control.displayPage === 'object') {
        const currentPage = moduleConfig?.page || 'default';
        return control.displayPage[currentPage] !== false; // keep if true or undefined
      } else if (control.displayPage === false) {
        return false; // remove explicitly hidden
      }
      return true;
    });

    return modifiedFormConfig;
  }

  evaluateFormula(formula: string, values: Record<string, any>): number {
    try {
      console.log('Evaluating formula:', formula, 'with values:', values);
      const keys = Object.keys(values);
      const vals = keys.map(k => {
        const v = values[k];
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
          const dateOnly = v.split('T')[0];
          return new Date(dateOnly + 'T00:00:00Z').getTime();
        }
        return v; // preserve arrays/objects
      });

      const fn = new Function(...keys, `return ${formula};`);
      const result = fn(...vals);
      return result;
    } catch (e) {
      console.warn('Formula evaluation error:', e);
      return 0;
    }
  }


  getCategoryConfig(category: any, moduleConfig: any): any {
    if (!category) return null;

    category.columns?.forEach((column: any) => {
      if (moduleConfig?.internationalFlag) {
        if (column.international === false) {
          // remove column if international is false
          const index = category.columns.indexOf(column);
          if (index > -1) {
            category.columns.splice(index, 1);
          }
        }
      }
    });

    // If no type or no matching config found, return the original category
    return category;
  }

  handleFieldBusinessCase(caseItem: any, form: any, moduleData: any, formConfig: any): void {
    console.log('Handling field business case:', caseItem, form, moduleData, formConfig);
    const service = this.serviceRegistry.getService(caseItem.apiService);
    const apiMethod = caseItem.apiMethod;
    let requestBody: any = caseItem.requestBody;
    if (!service || typeof service[apiMethod] !== 'function') {
      console.warn(`Invalid API service or method: ${caseItem.apiService}.${caseItem.apiMethod}`);
      return;
    }
    const queryParams: Record<string, any> = { ...caseItem.queryStringParameter };
    Object.entries(caseItem.inputControls).forEach(([controlName, requestKey]) => {
      if (typeof requestKey === 'string') { // Ensure requestKey is a string
        let controlValue: any;
        if (caseItem?.isGooglePlace) {
          controlValue = form.get(controlName)?.value?.label;
        } else {
          controlValue = form.get(controlName)?.value;
        }
        
        if (typeof controlValue === 'object' && controlValue !== null) {
          controlValue = controlValue.value ?? controlValue; // Handle case where controlValue is an object
        }
        queryParams[requestKey] = controlValue; // Extract Id if it's an object
      }
    }
    );
    const output = this.mapOtherControls(moduleData, caseItem.otherControls, caseItem?.landingBoxData);
    requestBody = { ...requestBody, ...queryParams, ...output };
    console.log('API Request Body:', requestBody);
    // if any value of requestBody is undefined, return
    if (Object.values(requestBody).some(value => value === undefined)) {
      console.warn('Request body contains undefined values:', requestBody);
      return;
    }
    service[apiMethod](requestBody).subscribe(
      (response: any) => {
        if (typeof caseItem.outputControl === 'object') {
          for (const [outputControl, responsePath] of Object.entries(caseItem.outputControl) as [string, string][]) {
            const extracted = this.extractValueFromPath(response, responsePath);

            if (extracted !== undefined && Array.isArray(extracted)) {
              // Find the form config item by control name
              const dependentCaseItem = formConfig.find(
                (item: any) => item.formConfig?.name === outputControl
              );

              if (dependentCaseItem) {
                dependentCaseItem.formConfig.options = extracted.map((item: any) => {
                  return {
                    label: item[caseItem.labelKey || 'label'],
                    value: item[caseItem.valueKey || 'value']
                  };
                });
              } else {
                console.warn(`Dependent config for control "${outputControl}" not found in formConfig.`);
              }
            } else {
              console.warn(`No array data found at path "${responsePath}" in response.`);
            }
            form.get(outputControl)?.setValue(extracted);
          }
        } else if (typeof caseItem.outputControl === 'string') {
          // Single field case
          const value = this.extractValueFromPath(response, caseItem.outputControl);
          if (value !== undefined) {
            form.get(caseItem.outputControl)?.setValue(value);
          }
        }
      },
      (error: any) => {
        console.error("API Error:", error);
      }
    );
  }

  /**
   * Checks for duplicate claims based on the provided form values and configuration.
   * @param form - The FormGroup containing the form values.
   * @param config - The configuration object containing fields and date range fields.
   * @param dataList - The list of existing claims to check against.
   * @param fieldsKey - The key in the config that contains the fields to compare.
   * @param dateRangeFieldsKey - The key in the config that contains the date range fields (optional).
   * @returns {boolean} - Returns true if a duplicate claim is found, otherwise false.
   */
  checkDuplicateClaim(
    form: FormGroup,
    config: any,
    dataList: any[],
    fieldsKey: string,
    dateRangeFieldsKey: string = 'dateRangeFields'
  ): boolean {
    console.log('Checking for duplicate claims', { fieldsKey, config, dataList }, form.value);
    const fields = config[fieldsKey];
    const dateFieldConfig = config.dateRangeFields?.[dateRangeFieldsKey] || {};

    const checkInField = dateFieldConfig.start;
    const checkOutField = dateFieldConfig.end;

    const currentFormValues: any = {};
    fields.forEach((field: string) => {
      currentFormValues[field] = form.get(field)?.value;
    });

    const currentCheckIn = checkInField ? new Date(currentFormValues[checkInField]).getTime() : null;
    const currentCheckOut = checkOutField ? new Date(currentFormValues[checkOutField]).getTime() : null;

    const matchedCategory = dataList
      ?.filter((entry: any) => entry.name === config.name)
      ?.flatMap((cat: any) => cat.data || []);

    return matchedCategory?.some((row: any) => {
      const rowCheckIn = checkInField ? new Date(row[checkInField]).getTime() : null;
      const rowCheckOut = checkOutField ? new Date(row[checkOutField]).getTime() : null;

      const isOverlap =
        currentCheckIn != null &&
        currentCheckOut != null &&
        rowCheckIn != null &&
        rowCheckOut != null &&
        currentCheckIn <= rowCheckOut &&
        currentCheckOut >= rowCheckIn;

      const otherFieldsMatch = fields
        .filter((f: any) => f !== checkInField && f !== checkOutField)
        .every((field: string) => {
          const formValue = currentFormValues[field];
          const rowValue = row[field];
          const val1 = typeof formValue === 'object' && formValue !== null ? formValue.value : formValue;
          const val2 = typeof rowValue === 'object' && rowValue !== null ? rowValue.value : rowValue;
          return val1 == val2;
        });

      return isOverlap && otherFieldsMatch;
    }) ?? false;
  }

  /**
   * Populates the form with data from the employee profile and module data.
   * @param form - The FormGroup to populate.
   * @param employeeProfile - The employee profile containing API service and method details.
   * @param moduleData - Additional data to be used in the request.
   */
  populateFormWithData(
    form: FormGroup,
    onInitAPIDetails: any,
    moduleData: any
  ): void {
    if (onInitAPIDetails) {
      const service = this.serviceRegistry.getService(onInitAPIDetails.apiService);
      const apiMethod = onInitAPIDetails.apiMethod;
      let requestBody: any = onInitAPIDetails.requestBody;
      const output = this.mapOtherControls(moduleData, onInitAPIDetails.otherControls);
      service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
        (response: any) => {
          if (typeof onInitAPIDetails.outputControl === 'object') {
            // Multiple fields case
            for (const [outputControl, responsePath] of Object.entries(onInitAPIDetails.outputControl) as [string, string][]) {
              const value = this.extractValueFromPath(response, responsePath);
              if (value !== undefined) {
                form.get(outputControl)?.setValue(value);
              }
            }
          }
        });
    }
  }

  /**
     * Formats a numeric value to the configured decimal precision.
     * @param value The value to format.
     * @returns The formatted value as a number.
     */
  getFormattedValue(value: any): number {
    const precision = this.configService.getDecimalPrecision?.() ?? 2;
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 0;
    }
    return parseFloat(num.toFixed(precision));
  }

}
