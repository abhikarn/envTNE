import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import { IFormControl } from './form-control.interface';
import { IValidationConfig } from './validation-config.interface';
import { CustomValidators } from './custom-validators';

export class FormControlFactory {
  static createControl(config: any): FormControl {
    const validationConfigs: IValidationConfig[] = config.validations || [];
    const validators: ValidatorFn[] = validationConfigs.map((validationConfig: IValidationConfig) => {
      let validatorFn: ValidatorFn | null = null;
      switch (validationConfig.type) {
        case 'required':
          config.validations['required'] = validationConfig.message || 'This field is required';
          validatorFn = Validators.required;
          break;
        case 'minLength':
          if (config.subType === 'text') {
            validatorFn = Validators.minLength(Number(validationConfig.value));
          } else {
            console.warn(`Ignoring minLength for numeric field: ${config.name}`);
          }
          break;
        case 'maxLength':
          validatorFn = Validators.maxLength(Number(validationConfig.value));
          break;
        case 'min':
          if (config.subType === 'number') {
            validatorFn = Validators.min(Number(validationConfig.value));
          }
          break;
        case 'max':
          if (config.subType === 'number') {
            validatorFn = Validators.max(Number(validationConfig.value));
          }
          break;
        case 'pattern':
          validatorFn = Validators.pattern(validationConfig.value);
          break;
        case 'custom':
          const validatorKey = validationConfig.name as keyof typeof CustomValidators;
          if (validatorKey in CustomValidators) {
            const validatorFunc = CustomValidators[validatorKey];
            if (typeof validatorFunc === 'function') {
              config.validations[validatorKey] = validationConfig.message || `Invalid ${config.name}`;
              validatorFn = validatorFunc(validationConfig.message);
            }
          } else {
            console.warn(`Custom validator not found: ${validationConfig.name}`);
          }
          break;

        default:
          throw new Error(`Unsupported validation type: ${validationConfig.type}`);
      }
      return validatorFn;
    }).filter((v): v is ValidatorFn => !!v); // Remove null values;

    const control = new FormControl('', validators.length ? Validators.compose(validators) : null);
    return control;
  }
}
