import { FormControl, Validators } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class PasswordInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    const validators = this.getValidators(config);
    return new FormControl(config.value || '', validators);
  }

  override getValidators(config: IFormControl): any[] {
    const validators = super.getValidators(config);
    
    // Add password-specific validations
    if (config.validations) {
      const minLengthValidation = config.validations.find(v => v.type === 'minLength');
      if (!minLengthValidation) {
        config.validations.push({
          type: 'minLength',
          value: 8,
          message: 'Password must be at least 8 characters long'
        });
      }

      const patternValidation = config.validations.find(v => v.type === 'pattern');
      if (!patternValidation) {
        config.validations.push({
          type: 'pattern',
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        });
      }
    }

    return validators;
  }
} 