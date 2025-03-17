import { FormControl } from '@angular/forms';
import { IValidationConfig } from './validation-config.interface';
import { Observable } from 'rxjs';

export interface IFormControl {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  // control: FormControl;
  options?: any[];
  option$?: Observable<any[]>;
  value?: any;
  value$?:any;
  validations?: IValidationConfig[];
  validationMessages?: any;
}
