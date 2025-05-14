import { FormControl } from '@angular/forms';
import { IValidationConfig } from './validation-config.interface';
import { Observable } from 'rxjs';

export interface IFormControl {
  type?: string;
  subType?: string;
  dataType?: string;
  name: string;
  label?: string;
  isExcluded?: boolean;
  placeholder?: string;
  value?: any;
  value$?:any;
  options?: any[];
  option$?: Observable<any[]>;
  labelKey?: string;
  valueKey?: string;
  apiService?: string;
  apiMethod?: string;
  events?: any;
  autoComplete?: boolean,
  disable?: boolean;
  defaultValue?: any;
  autoFormat?: any;
  dependentCases?: any;
  readonly?: boolean;
  multiple?: boolean; // File Control
  accept?: string; // File Control
  validations?: IValidationConfig[];
  validationMessages?: any;
  getControl?: any; // GST,
  dependsOn?: any;
  payloadKey?: string;
  showInUI?: boolean;
  fields?: any;
  notifications?: any;
  required?: boolean;
}
