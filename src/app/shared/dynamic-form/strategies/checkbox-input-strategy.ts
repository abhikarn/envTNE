import { FormControl, ValidatorFn } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class CheckboxInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    // Add checkbox-specific validations here if needed
    return validators;
  }
} 