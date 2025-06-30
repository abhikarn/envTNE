import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
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

    service?.[apiMethod]?.({ ...requestBody, ...output }).subscribe(
      (response: any) => {
        if (typeof category.policyEntitlementCheckApi.outputControl === 'object') {
          // Multiple fields case
          for (const [outputControl, responsePath] of Object.entries(category.policyEntitlementCheckApi.outputControl) as [string, string][]) {
            const value = this.extractValueFromPath(response, responsePath);
            if (value !== undefined) {
              form.get(outputControl)?.setValue(value);
            }
          }
        }
      });

    if (form.value.IsActual) {
      const fieldsToRemove = [
        'EntitlementCurrency',
        'EntitlementAmount',
        'EntitlementConversionRate',
        'DifferentialAmount(INR)'
      ];

      fieldsToRemove.forEach(field => {
        form.removeControl(field);
        const control = formControls.find(c => c.formConfig.name === field);
        if (control) {
          control.formConfig.showInUI = false;
        }
      });
    }
    this.updateConditionalValidators(form, formControls);
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

  mapOtherControls(data: any, otherControls: Record<string, string>): Record<string, any> {
    const mappedResult: Record<string, any> = {};

    for (const [outputKey, sourceKey] of Object.entries(otherControls)) {
      mappedResult[outputKey] = data[sourceKey] ?? null; // fallback to null if key not found
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
        const output = this.mapOtherControls(moduleData, businessCaseData.otherControls);
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
    // handle international data
    if (moduleConfig?.internationalFlag) {
      formConfig.forEach((control: IFormControl) => {
        if (control.international === false) {
          // remove control if international is false
          const index = formConfig.indexOf(control);
          if (index > -1) {
            formConfig.splice(index, 1);
          }
        }

        if(control?.dependentCases?.length > 0) {
          control.dependentCases.forEach((caseConfig: any) => {
            if (caseConfig?.type?.includes('international')) {
              // If the case type includes 'international', ensure the control is included
              if (!formConfig.includes(control)) {
                formConfig.push(control);
              }
            }
          });
        }
      });
    } else {
      formConfig.forEach((control: IFormControl) => {
        if (control.international === true) {
          // remove control if international is true
          const index = formConfig.indexOf(control);
          if (index > -1) {
            formConfig.splice(index, 1);
          }
        }
      });
    }
    return formConfig;
  }

  evaluateFormula(formula: string, values: Record<string, number | string>): number {
    try {
      const keys = Object.keys(values);
      // Convert all values to numbers safely
      const vals = Object.values(values).map(v => Number(v));
      const fn = new Function(...keys, `return ${formula};`);
      return fn(...vals);
    } catch (e) {
      console.warn('Formula evaluation error:', e);
      return 0;
    }
  }

}
