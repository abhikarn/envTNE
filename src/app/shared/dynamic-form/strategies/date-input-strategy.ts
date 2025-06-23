import { FormControl, ValidatorFn } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class DateInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    // Add date-specific validations here if needed
    // Example: Ensure the date is not in the past
    // validators.push(Validators.min(new Date()));
    return validators;
  }
}