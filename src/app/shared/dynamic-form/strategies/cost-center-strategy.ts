import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class CostCenterStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add cost center specific validations
    if (config.validations) {
      // Add validation for multiple cost center flag
      if (config.required) {
        validators.push(Validators.required);
      }

      // Add validation for cost center fields if they exist
      if (config.fields) {
        config.fields.forEach((field: IFormControl) => {
          if (field.required) {
            validators.push(Validators.required);
          }
        });
      }
    }

    return validators;
  }
}