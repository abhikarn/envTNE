import { FormControl } from '@angular/forms';
import { IValidationConfig } from './validation-config.interface';
import { Observable } from 'rxjs';

export type FormControlType = 
  | 'text' 
  | 'select' 
  | 'date' 
  | 'password' 
  | 'multiSelect' 
  | 'gst' 
  | 'costCenter' 
  | 'lineWiseCostCenter'
  | 'hidden'
  | 'email'
  | 'textarea'
  | 'radio'
  | 'file'
  | 'multi-select';

export type FormControlDataType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export interface IAutoFormatConfig {
  decimalPrecision?: number;
  patterns?: string[];
  range?: {
    max?: number;
    min?: number;
  };
}

export interface IPasswordSettings {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

export interface IFormControl {
  // Basic Properties
  type?: FormControlType;
  subType?: string;
  dataType?: FormControlDataType;
  name: string;
  label?: string;
  placeholder?: string;
  value?: any;
  value$?: Observable<any>;
  defaultValue?: any;
  required?: boolean;
  requiredIf?: any;
  readonly?: boolean;
  disable?: boolean;
  showInUI?: boolean;
  icon?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  // API Integration
  apiService?: string;
  apiMethod?: string;
  payloadKey?: string;

  // Options and Selection
  options?: any[];
  option$?: Observable<any[]>;
  labelKey?: string;
  valueKey?: string;
  autoComplete?: boolean;
  multiple?: boolean;

  // File Upload
  accept?: string;
  maxSizeMB?: number;
  referenceType?: string;

  // Validation
  validations?: IValidationConfig[];
  validationMessages?: Record<string, string>;

  // Formatting and Calculation
  autoFormat?: IAutoFormatConfig;
  calculate?: any;

  // Dependencies and Events
  dependsOn?: any;
  dependentCases?: any;
  events?: Record<string, string>;
  getControl?: any;

  // Special Features
  isExcluded?: boolean;
  fields?: any;
  notifications?: any;
  passwordVisibility?: boolean;
  passwordSattings?: IPasswordSettings;
  policyViolationCheck?: any;
  oCRRequired?: boolean;
  time?: any;
  minDate?: string | Date;
  maxDate?: string | Date;
  apiDateLimit?: boolean;
  EntitlementAmountCalculation?: any;
  taxCalculation?: any;
}
