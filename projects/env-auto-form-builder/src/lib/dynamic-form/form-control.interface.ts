import { FormControl } from '@angular/forms';
import { IValidationConfig } from './validation-config.interface';

export interface IFormControl {
  name: string;
  label: string;
  type: string;
  control: FormControl;
  options?: any[];
  validations?: IValidationConfig[];
  validationMessages?: any;
}
