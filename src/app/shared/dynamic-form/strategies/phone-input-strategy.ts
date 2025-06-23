import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class PhoneInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    return new FormControl(config.value, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add phone-specific validations
    if (config.validations) {
      // Check if pattern validation already exists
      const hasPattern = config.validations.some(v => v.type === 'pattern');
      if (!hasPattern) {
        // International phone number pattern (E.164 format)
        // Allows: +[country code][number] format
        // Example: +1234567890
        const phonePattern = /^\+[1-9]\d{1,14}$/;
        validators.push(Validators.pattern(phonePattern));
        config.validations.push({
          type: 'pattern',
          value: phonePattern,
          message: 'Please enter a valid phone number in international format (e.g., +1234567890)'
        });
      }

      // Add minLength validation if not already specified
      const hasMinLength = config.validations.some(v => v.type === 'minLength');
      if (!hasMinLength) {
        // Minimum length for international phone numbers (including country code)
        validators.push(Validators.minLength(8));
        config.validations.push({
          type: 'minLength',
          value: 8,
          message: 'Phone number must be at least 8 digits long'
        });
      }

      // Add maxLength validation if not already specified
      const hasMaxLength = config.validations.some(v => v.type === 'maxLength');
      if (!hasMaxLength) {
        // Maximum length for international phone numbers (including country code)
        validators.push(Validators.maxLength(15));
        config.validations.push({
          type: 'maxLength',
          value: 15,
          message: 'Phone number cannot exceed 15 digits'
        });
      }
    }

    return validators;
  }
} 