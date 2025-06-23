import { FormControl, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { BaseFormControlStrategy } from './base-form-control-strategy';

export class MultiSelectInputStrategy extends BaseFormControlStrategy {
  createControl(config: IFormControl): FormControl {
    // Initialize with empty array if no value is provided
    const initialValue = config.value || [];
    return new FormControl(initialValue, this.getValidators(config));
  }

  override getValidators(config: IFormControl): ValidatorFn[] {
    const validators = super.getValidators(config);
    
    // Add multi-select specific validations
    if (config.validations) {
      // Add min selection validation if not already specified
      const hasMinSelection = config.validations.some(v => v.type === 'minSelection');
      if (!hasMinSelection && config.validations.some(v => v.type === 'min')) {
        const minValidation = config.validations.find(v => v.type === 'min');
        if (minValidation) {
          validators.push(this.minSelectionValidator(Number(minValidation.value)));
          config.validations.push({
            type: 'minSelection',
            value: minValidation.value,
            message: minValidation.message || `Please select at least ${minValidation.value} items`
          });
        }
      }

      // Add max selection validation if not already specified
      const hasMaxSelection = config.validations.some(v => v.type === 'maxSelection');
      if (!hasMaxSelection && config.validations.some(v => v.type === 'max')) {
        const maxValidation = config.validations.find(v => v.type === 'max');
        if (maxValidation) {
          validators.push(this.maxSelectionValidator(Number(maxValidation.value)));
          config.validations.push({
            type: 'maxSelection',
            value: maxValidation.value,
            message: maxValidation.message || `Please select at most ${maxValidation.value} items`
          });
        }
      }
    }

    return validators;
  }

  private minSelectionValidator(min: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value as any[];
      if (!value || value.length < min) {
        return { minSelection: { required: min, actual: value?.length || 0 } };
      }
      return null;
    };
  }

  private maxSelectionValidator(max: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value as any[];
      if (value && value.length > max) {
        return { maxSelection: { required: max, actual: value.length } };
      }
      return null;
    };
  }
} 