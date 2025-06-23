import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { IFormControlStrategy } from './form-control-strategy.interface';
import { CustomValidators } from './custom-validators/custom-validators';
import { IValidationConfig } from '../validation-config.interface';

export abstract class BaseFormControlStrategy implements IFormControlStrategy {
  abstract createControl(config: IFormControl): FormControl;

  getValidators(config: IFormControl): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (config.validations) {
      for (const validation of config.validations) {
        const validator = this.getValidatorForType(validation, config);
        if (validator) {
          validators.push(validator);
        }
      }
    }
    return validators;
  }

  protected getValidatorForType(validation: IValidationConfig, config: IFormControl): ValidatorFn | null {
    switch (validation.type) {
      case 'required':
        this.setValidationMessage(config, 'required', validation.message || `${config.label} is required`);
        return Validators.required;
      
      case 'minLength':
        if (config.subType === 'text') {
          return Validators.minLength(Number(validation.value));
        }
        console.warn(`Ignoring minLength for numeric field: ${config.name}`);
        return null;
      
      case 'maxLength':
        return Validators.maxLength(Number(validation.value));
      
      case 'min':
        if (config.subType === 'number') {
          return Validators.min(Number(validation.value));
        }
        return null;
      
      case 'max':
        if (config.subType === 'number') {
          return Validators.max(Number(validation.value));
        }
        return null;
      
      case 'pattern':
        return Validators.pattern(validation.value);
      
      case 'email':
        this.setValidationMessage(config, 'email', validation.message || 'Invalid email format');
        return Validators.email;
      
      case 'custom':
        return this.getCustomValidator(validation, config);
      
      default:
        console.warn(`Unsupported validation type: ${validation.type}`);
        return null;
    }
  }

  protected getCustomValidator(validation: IValidationConfig, config: IFormControl): ValidatorFn | null {
    const validatorKey = validation.name as keyof typeof CustomValidators;
    if (validatorKey in CustomValidators) {
      const validatorFunc = CustomValidators[validatorKey];
      if (typeof validatorFunc === 'function') {
        this.setValidationMessage(config, validatorKey, validation.message || `Invalid ${config.name}`);
        return validatorFunc(validation.message);
      }
    }
    console.warn(`Custom validator not found: ${validation.name}`);
    return null;
  }

  protected setValidationMessage(config: IFormControl, key: string, message: string): void {
    if (config.validations && typeof config.validations === 'object') {
      (config.validations as any)[key] = message;
    }
  }
} 