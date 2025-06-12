import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateInputComponent } from '../form-controls/calender/date-input.component';
import { SelectInputComponent } from '../form-controls/dropdown/select-input.component';
import { FileUploadComponent } from '../form-controls/file-upload/file-upload.component';
import { GstComponent } from '../form-controls/gst/gst.component';
import { TextInputComponent } from '../form-controls/input-control/text-input.component';
import { MultiSelectInputComponent } from '../form-controls/multi-select/multi-select-input.component';
import { RadioInputComponent } from '../form-controls/radio/radio-input.component';
import { TextAreaInputComponent } from '../form-controls/text-area/text-area-input.component';
import { IFormControl } from '../form-control.interface';
import { ServiceRegistryService } from '../../service/service-registry.service';
import { FormControlFactory } from '../form-control.factory';

@Component({
  selector: 'app-create-dynamic-form',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    SelectInputComponent,
    DateInputComponent,
    TextAreaInputComponent,
    MultiSelectInputComponent,
    FileUploadComponent,
    RadioInputComponent,
    GstComponent
  ],
  templateUrl: './create-dynamic-form.component.html',
  styleUrl: './create-dynamic-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CreateDynamicFormComponent {
  @Input() formConfig: IFormControl[] = [];
  @Output() emitTextData = new EventEmitter<any>();
  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];

  constructor(
    private serviceRegistry: ServiceRegistryService
  ) { }

  ngOnInit() {
    this.formControls = []; // Reset to avoid duplication
    this.form = new FormGroup({});
    this.formConfig.forEach(config => {
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
    });
  }

  getInputValue(input: any) {
    this.emitTextData.emit(input);
  }

  onDropdownValueChange({ event, control }: { event: any; control: IFormControl }) {
    const changedControlName = control.name;
    const selectedValue = event.value;

    this.formConfig.forEach((ctrlConfig: any) => {
      if (ctrlConfig.dependsOn === changedControlName) {
        const service = this.serviceRegistry.getService(ctrlConfig.apiService);
        const apiMethod = ctrlConfig.apiMethod;
        const payloadKey = ctrlConfig.payloadKey || `${changedControlName}Id`; // fallback if not defined

        const payload = { [payloadKey]: selectedValue }; // Dynamic payload

        if (service && typeof service[apiMethod] === 'function') {
          service[apiMethod](payload).subscribe((data: any) => {
            const labelKey = ctrlConfig.labelKey || 'label';
            const valueKey = ctrlConfig.valueKey || 'value';
            ctrlConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));

            // Reset dependent control
            const dependentControl = this.form.get(ctrlConfig.name);
            dependentControl?.reset();
          });
        }
      }
    });
  }

  getFormData() {
    return this.form;
  }

  reset() {
    this.form.reset();
  }
}
