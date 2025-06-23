import { FormControl, ValidatorFn } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class NumberInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    // Add number-specific validations here if needed
    // Example: Validate decimal places, step value, etc.
    return validators;
  }
} 