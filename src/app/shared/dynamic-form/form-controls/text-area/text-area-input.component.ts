import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IFormControl } from '../../form-control.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormControlFactory } from '../../form-control.factory';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-text-area-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FunctionWrapperPipe
  ],
  templateUrl: './text-area-input.component.html',
  styleUrls: ['./text-area-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextAreaInputComponent {
  @Input() control: FormControl = new FormControl(null);
  @Input() controlConfig: IFormControl = { name: '' };

  constructor() {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  getErrorMessage(status: boolean): string {
    
    if (this.control) {
      const errors = this.control.errors;
      if (errors && errors['required']) {
        return this.controlConfig?.validations?.find((v: any) => v.type === 'required')?.message || `${this.controlConfig.label} is required`;
      }
    }

    if (!this.controlConfig?.validations) return '';
    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }
}
