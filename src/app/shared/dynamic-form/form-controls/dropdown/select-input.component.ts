import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { Subscription } from 'rxjs';
import { ServiceRegistryService } from '../../../service/service-registry.service';



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
  disable: boolean = false;
  apiSubscription?: Subscription;

  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? index;
  }

  constructor(
    private serviceRegistry: ServiceRegistryService
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    this.loadOptions();
    if (this.controlConfig.defaultValue) {
      this.control.setValue(this.controlConfig.defaultValue.Id);
    }
    
    if (this.controlConfig.disable) {
      this.control.disable();
    }

  }

  private loadOptions() {
    if (!this.controlConfig.apiService || !this.controlConfig.apiMethod || this.controlConfig.payloadKey) return;
  
    const apiService = this.serviceRegistry.getService(this.controlConfig.apiService);
    if (apiService && typeof apiService[this.controlConfig.apiMethod] === 'function') {
      this.apiSubscription = apiService[this.controlConfig.apiMethod]().subscribe(
        (data: any) => {
          const labelKey = this.controlConfig.labelKey || 'label';
          const valueKey = this.controlConfig.valueKey || 'value';
          this.controlConfig.options = data.ResponseValue.map((item: any) => ({
            label: item[labelKey],
            value: item[valueKey]
          }));
        },
        (error: any) => {
          console.error('API Error:', error);
        }
      );
    } else {
      console.warn(`Invalid API service or method: ${this.controlConfig.apiService}.${this.controlConfig.apiMethod}`);
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

  onReadonlySelection(event: MatSelectChange): void {
    if (this.controlConfig.readonly) {
      event.source.writeValue(this.controlConfig.value); // revert back to original
    }
  }

}
