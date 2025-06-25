import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { ServiceRegistryService } from './service-registry.service';
import { IFormControl } from '../dynamic-form/form-control.interface';
import { ConfirmDialogService } from './confirm-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private confirmDialogService: ConfirmDialogService
  ) { }


  scrollToFirstInvalidControl(querySelector: string): void {
    const firstInvalidControl: HTMLElement | null = document.querySelector(querySelector + ' .ng-invalid');

    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidControl.focus?.(); // optional
    }
  }

  setCalculatedFields(form: any, formControls: any[], configService: any): void {
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
      form.get(control.formConfig.name)?.setValue(calculatedValue.toFixed(configService.getDecimalPrecision()));
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
}
