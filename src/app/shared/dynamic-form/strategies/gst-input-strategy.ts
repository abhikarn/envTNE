import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class GstInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add GST-specific validations
    if (config.validations) {
      // Check if pattern validation already exists
      const hasPattern = config.validations.some(v => v.type === 'pattern');
      if (!hasPattern) {
        // GST number pattern: 2 digits state code + 10 digits PAN + 1 digit entity number + 1 digit check digit
        const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        validators.push(Validators.pattern(gstPattern));
        config.validations.push({
          type: 'pattern',
          value: gstPattern,
          message: 'Please enter a valid GST number'
        });
      }

      // Add length validation if not already specified
      const hasLength = config.validations.some(v => v.type === 'maxLength');
      if (!hasLength) {
        validators.push(Validators.maxLength(15));
        config.validations.push({
          type: 'maxLength',
          value: 15,
          message: 'GST number must be 15 characters long'
        });
      }
    }

    return validators;
  }
} 