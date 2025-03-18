import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import { IFormControl } from './form-control.interface';
import { IValidationConfig } from './validation-config.interface';

export class FormControlFactory {
  static createControl(config: any): FormControl {
    const validationConfigs: IValidationConfig[] = config.validations || [];
    const validators: ValidatorFn[] = validationConfigs.map((validationConfig: IValidationConfig) => {
      let validatorFn: ValidatorFn;
      switch (validationConfig.type) {
        case 'required':
          validatorFn = Validators.required;
          break;
        case 'minLength':
          validatorFn = Validators.minLength(Number(validationConfig.value));
          break;
        case 'maxLength':
          validatorFn = Validators.maxLength(Number(validationConfig.value));
          break;
        case 'pattern':
          validatorFn = Validators.pattern(validationConfig.value);
          break;
        default:
          throw new Error(`Unsupported validation type: ${validationConfig.type}`);
      }
      return validatorFn;
    });

    const control = new FormControl('', validators);
    return control;
  }
}
