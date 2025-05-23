import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static validateGST(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const gstNumber = control.value?.toUpperCase().trim();
      return gstRegex.test(gstNumber) ? null : { validateGST: message || 'Invalid GST number' };
    };
  }

  static passwordPolicyValidator(config: {
    minLength?: number;
    maxLength?: number;
    upperCase?: boolean;
    lowerCase?: boolean;
    specialChar?: boolean;
    numeric?: boolean;
  }): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';

      const errors: ValidationErrors = {};

      if (config.minLength && value.length < config.minLength) {
        errors['minLength'] = `Minimum length is ${config.minLength}`;
      }

      if (config.maxLength && value.length > config.maxLength) {
        errors['maxLength'] = `Maximum length is ${config.maxLength}`;
      }

      if (config.upperCase && !/[A-Z]/.test(value)) {
        errors['upperCase'] = 'At least one uppercase letter is required';
      }

      if (config.lowerCase && !/[a-z]/.test(value)) {
        errors['lowerCase'] = 'At least one lowercase letter is required';
      }

      if (config.numeric && !/[0-9]/.test(value)) {
        errors['numeric'] = 'At least one numeric digit is required';
      }

      if (config.specialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors['specialChar'] = 'At least one special character is required';
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static upperCase(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasUpperCase = /[A-Z]/.test(control.value);
      return hasUpperCase ? null : { upperCase: { message } };
    };
  }

  static lowerCase(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasLowerCase = /[a-z]/.test(control.value);
      return hasLowerCase ? null : { lowerCase: { message } };
    };
  }

  static specialChar(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      return hasSpecialChar ? null : { specialChar: { message } };
    };
  }

  static numeric(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasNumber = /\d/.test(control.value);
      return hasNumber ? null : { numeric: { message } };
    };
  }
}
