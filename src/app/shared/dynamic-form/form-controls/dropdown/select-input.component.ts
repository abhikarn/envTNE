import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';



@Component({
  selector: 'lib-select-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FunctionWrapperPipe
],
  templateUrl: './select-input.component.html'
})
export class SelectInputComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = {name: ''};
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  disable: boolean = false;;

  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? index;
  }

  constructor() {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    if (this.controlConfig.defaultValue) {
      this.control.setValue(this.controlConfig.defaultValue);
    }
    
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  getErrorMessage(status: boolean): string {
    if (!this?.controlConfig?.validations) return '';
  
    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }
  
    return 'Invalid selection'; // Default fallback message
  }

  // Emit selection change event
  onSelectionChange(event: any) {
    this.valueChange.emit({ event, control: this.controlConfig });
  }
}
