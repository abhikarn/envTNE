import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IFormControl } from '../../form-control.interface';
import { CommonModule } from '@angular/common';
import { catchError, Observable, of, take } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { FormControlFactory } from '../../form-control.factory';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';



@Component({
  selector: 'lib-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
     MatFormFieldModule, MatInputModule, 
     MatAutocompleteModule, MatOptionModule,
    FunctionWrapperPipe],
  templateUrl: './text-input.component.html'
})
export class TextInputComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Output() emitInputValue = new EventEmitter<any>();

  constructor() {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    if(this.controlConfig.autoComplete)
    this.control.valueChanges.subscribe(inputValue => {
      this.emitInputValue.emit(inputValue);
    });
  }

  onNumberInput(event: any) {
    if (this.controlConfig.autoFormat) {
      let inputValue = event.target.value.replace(this.controlConfig.autoFormat.pattern, '');;
      if (inputValue.length > this.controlConfig.autoFormat.range.max) {
        inputValue = inputValue.substring(0, this.controlConfig.autoFormat.range.max);
      }
      this.control.setValue(inputValue, { emitEvent: false });
    }
  }

  onBlur() {
    if (this.controlConfig.autoFormat) {
      let value = this.control.value;
      if (value == 0) {
        this.control.setValue("0.00", { emitEvent: false });
        return;
      }
      if (value && value !== '') {
        this.control.setValue(`${value}${this.controlConfig.autoFormat.decimal}`, { emitEvent: false });
      }
    }
  }

  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? index;
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

  displayFn(city: any): string {
    return city ? city.City : '';
  }
}
