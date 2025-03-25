import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import { IFormControl } from './form-control.interface';
import { IValidationConfig } from './validation-config.interface';

export class FormControlFactory {
  static createControl(config: any): FormControl {
    const validationConfigs: IValidationConfig[] = config.validations || [];
    const validators: ValidatorFn[] = validationConfigs.map((validationConfig: IValidationConfig) => {
      let validatorFn: ValidatorFn | null = null;
      switch (validationConfig.type) {
        case 'required':
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
        default:
          throw new Error(`Unsupported validation type: ${validationConfig.type}`);
      }
      return validatorFn;
    }).filter((v): v is ValidatorFn => !!v); // Remove null values;
   
    const control = new FormControl('', validators.length ? Validators.compose(validators) : null);
    return control;
  }
}
