import { FormControl } from '@angular/forms';
import { IValidationConfig } from './validation-config.interface';
import { Observable } from 'rxjs';

export interface IFormControl {
  parentId?: number;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  subType?: string;
  // control: FormControl;
  options?: any[];
  option$?: Observable<any[]>;
  value?: any;
  value$?:any;
  validations?: IValidationConfig[];
  validationMessages?: any;
  multiple?: boolean;
  accept?: string;
  autoComplete?: boolean,
  isExcluded?: boolean;
  disable?: boolean;
  defaultValue?: any;
}
