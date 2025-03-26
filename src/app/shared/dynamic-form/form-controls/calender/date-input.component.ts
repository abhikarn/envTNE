
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IFormControl } from '../../form-control.interface';
import { MatInputModule } from '@angular/material/input';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'lib-date-input',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FunctionWrapperPipe
],
  templateUrl: './date-input.component.html',
  providers: [DatePipe]
})
export class DateInputComponent {
  @Input() control: FormControl = new FormControl(null);
  @Input() controlConfig: IFormControl = {name: ''};
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  
  constructor(private datePipe: DatePipe) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }
  
  ngOnInit() {
    this.control.valueChanges.subscribe(value => {
      if (value instanceof Date) {
        const isoDate = value.toISOString(); // Convert to ISO 8601 format
        this.control.setValue(isoDate, { emitEvent: false }); // Prevent infinite loop
      }
    });
  }

  getErrorMessage(): string {
    if (!this?.controlConfig?.validations) return '';
  
    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }
  
    return 'Invalid selection'; // Default fallback message
  }

  onDateSelect(event: MatDatepickerInputEvent<Date>): void {
    const formattedDate = this.datePipe.transform(event.value, 'dd/MMM/yyyy');
    console.log('Formatted Date:', formattedDate);
    this.valueChange.emit({ event, control: this.controlConfig });
  }

}
