import { Component, Input } from '@angular/core';
import { IFormControl } from '../../form-control.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormControlFactory } from '../../form-control.factory';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-text-area-input',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  templateUrl: './text-area-input.component.html'
})
export class TextAreaInputComponent {
  @Input() control: FormControl = new FormControl(null);
  @Input() controlConfig: IFormControl = {name: ''};

  getErrorMessage(): string {
    if (!this.controlConfig?.validations) return '';
  
    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }
  
    return 'Invalid selection'; // Default fallback message
  }
}
