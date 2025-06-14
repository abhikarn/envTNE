import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class EmailInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add email-specific validations
    if (config.validations) {
      // Check if email validation already exists
      const hasEmail = config.validations.some(v => v.type === 'email');
      if (!hasEmail) {
        validators.push(Validators.email);
        config.validations.push({
          type: 'email',
          message: 'Please enter a valid email address'
        });
      }

      // Add pattern validation for stricter email format if not already specified
      const hasPattern = config.validations.some(v => v.type === 'pattern');
      if (!hasPattern) {
        // RFC 5322 compliant email pattern
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        validators.push(Validators.pattern(emailPattern));
        config.validations.push({
          type: 'pattern',
          value: emailPattern,
          message: 'Please enter a valid email address'
        });
      }
    }

    return validators;
  }
} 