import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class LineWiseCostCenterStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add line-wise cost center specific validations
    if (config.validations) {
      // Add validation for cost center lines
      if (config.required) {
        validators.push(Validators.required);
      }

      // Add validation for line items if they exist
      if (config.fields) {
        config.fields.forEach((field: IFormControl) => {
          if (field.required) {
            validators.push(Validators.required);
          }
        });
      }

      // Add validation for total amount if specified
      if (config.autoFormat?.range) {
        if (config.autoFormat.range.min !== undefined) {
          validators.push(Validators.min(config.autoFormat.range.min));
        }
        if (config.autoFormat.range.max !== undefined) {
          validators.push(Validators.max(config.autoFormat.range.max));
        }
      }
    }

    return validators;
  }
} 