import { Component, forwardRef, Input } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { Observable, of } from 'rxjs';
import { FormControlFactory } from '../../form-control.factory';

@Component({
  selector: 'lib-radio-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    FunctionWrapperPipe
  ],
  templateUrl: './radio-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioInputComponent),
      multi: true,
    },
  ],
})
export class RadioInputComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };

  constructor() {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  trackByFn(index: number, item: any): any {
    return item.value;
  }

  getErrorMessage(status: boolean): string {
    if (!this.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }

}
