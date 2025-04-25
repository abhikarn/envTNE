import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static validateGST(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const gstNumber = control.value?.toUpperCase().trim();
      return gstRegex.test(gstNumber) ? null : { validateGST: message || 'Invalid GST number' };
    };
  }
}
