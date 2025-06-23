import { FormControl, ValidatorFn } from '@angular/forms';
import { IFormControl } from '../form-control.interface';

export interface IFormControlStrategy {
  createControl(config: IFormControl): FormControl;
  getValidators(config: IFormControl): ValidatorFn[];
} 