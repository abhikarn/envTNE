import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl } from './form-control.interface';

import { TextInputComponent } from './form-controls/input-control/text-input.component';
import { SelectInputComponent } from './form-controls/dropdown/select-input.component';
import { DateInputComponent } from './form-controls/calender/date-input.component';
import { TextAreaInputComponent } from './form-controls/text-area/text-area-input.component';
import { MultiSelectInputComponent } from './form-controls/multi-select/multi-select-input.component';
import { FileUploadComponent } from './form-controls/file-upload/file-upload.component';
import { DynamicTableComponent } from '../component/dynamic-table/dynamic-table.component';
import { RadioInputComponent } from './form-controls/radio/radio-input.component';
import { GstComponent } from './form-controls/gst/gst.component';
import { ServiceRegistryService } from '../service/service-registry.service';


@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    SelectInputComponent,
    DateInputComponent,
    TextAreaInputComponent,
    MultiSelectInputComponent,
    FileUploadComponent,
    DynamicTableComponent,
    RadioInputComponent,
    GstComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() id: any;
  @Input() name: number = 0;
  @Input() formConfig: IFormControl[] = [];
  @Input() eventHandler: any;
  @Input() minSelectableDate?: Date;
  @Input() maxSelectableDate?: Date;
  @Input() existingData: any;
  @Output() emitFormData = new EventEmitter<any>();
  @Output() emitTextData = new EventEmitter<any>();
  @Output() emitFormConfigData = new EventEmitter<any>();
  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  tableData: any = [];
  selectedRow: any;
  formData: any = {};
  editIndex = 0;
  referenceId = 0;

  constructor(
    private serviceRegistry: ServiceRegistryService
  ) { }

  ngOnInit() {
    this.formConfig.forEach(config => {
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
    });
    setTimeout(() => {
      this.existingData.data?.forEach((data: any) => {
        // Preparing Data for Dynamic table
        this.formControls.forEach(control => {
          const { type, name, autoComplete, options } = control.formConfig;
          if ((type == "select" || autoComplete) && name in data) {
            let selected = data[name];
            if (selected && typeof selected == "object") {
              selected = selected.value;
            }
            const matchedOption = options?.find(option => option.value === selected);
            if (matchedOption) {
              data[name] = matchedOption
            }
          }
        });
        this.tableData.push(data)
      })
    }, 1000);
  }

  onDropdownValueChange({ event, control }: { event: any; control: IFormControl }) {
    const changedControlName = control.name;
    const selectedValue = event.value;
  
    this.formConfig.forEach((ctrlConfig: any) => {
      if (ctrlConfig.dependsOn === changedControlName) {
        const service = this.serviceRegistry.getService(ctrlConfig.apiService);
        const apiMethod = ctrlConfig.apiMethod;
        const payloadKey = ctrlConfig.payloadKey || `${changedControlName}Id`; // fallback if not defined
  
        const payload = { [payloadKey]: selectedValue }; // 👈 Dynamic payload
  
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
  
  
  /**
   * Handles dynamic event execution
   * @param eventType - Event type (e.g., change, input)
   * @param data - Event payload from lib-select-input
   */
  handleEvent(eventType: string, data: { event: any; control: any }) {
    const field = data.control;
    const event = data.event;
    const handlerName = field.events?.[eventType];

    if (handlerName && typeof this.eventHandler[handlerName] === 'function') {
      this.eventHandler[handlerName](event, field);
    } else {
      console.warn(`Handler '${handlerName}' is not defined for ${field.name}.`);
    }
  }

  onSubmit() {
    // if(this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }
    // Logic for autocomplete field like city to save the object value for display purpose
    this.formControls.forEach(control => {
      let { name, autoComplete } = control.formConfig;
      if (autoComplete && name in this.form.value) {
        let selected = this.form.value[name];
        if (selected && typeof selected == "object") {
          if (!control.formConfig.options) {
            control.formConfig.options = [];
          }
          control.formConfig.options.push(selected);
          selected = selected.value;
        }
        this.form.get(name)?.setValue(selected);
      }
    });

    // Preparing form json
    this.formData.name = this.name;
    this.formControls.forEach(control => {
      const type = control.formConfig.type;
      const fieldName = control.formConfig.name;
      let fieldValue = this.form.value[fieldName];

      control.formConfig.value = fieldValue;
      if (!this.formData.data) {
        this.formData.data = {
          ReferenceId: 0
        };
      } else {
        this.formData.data.ReferenceId = this.referenceId
      }
      if (!this.formData.data?.excludedData) {
        this.formData.data.excludedData = {};
      }
      if (control.formConfig.isExcluded) {
        this.formData.data.excludedData[fieldName] = fieldValue ?? null;
      } else {
        this.formData.data[fieldName] = fieldValue ?? null;
      }
    })
    this.emitFormData.emit(this.formData);
    this.formData = {};

    // Preparing Data for Dynamic table
    this.formControls.forEach(control => {
      const { type, name, autoComplete, options } = control.formConfig;
      if ((type == "select" || autoComplete) && name in this.form.value) {
        let selected = this.form.value[name];
        if (selected && typeof selected == "object") {
          selected = selected.value;
        }
        const matchedOption = options?.find(option => option.value === selected);
        if (matchedOption) {
          this.form.get(name)?.setValue(matchedOption);
        }
      }
    });


    if (!this.editIndex) { //Create
      this.tableData.push(this.form.value);
    } else { // Edit
      this.tableData[this.editIndex - 1] = this.form.value;
      this.editIndex = 0;
    }

    this.emitFormConfigData.emit(this.formConfig)
    this.form.reset();
  }

  onEditRow(rowData: any) {
    this.editIndex = rowData.index;
    this.referenceId = rowData.row.ReferenceId;
    this.selectedRow = { ...rowData.row };
    console.log(this.selectedRow);

    this.formControls.forEach((control: any) => {
      const { name, type } = control.formConfig;

      if (!this.form.controls[name]) return;

      const value = this.selectedRow[name];

      if (type === 'select') {
        if (!control.formConfig.options?.length) {
          const service = this.serviceRegistry.getService(control.formConfig.apiService);
          const apiMethod = control.formConfig.apiMethod;
          const dependsOnValue = this.selectedRow[control.formConfig.dependsOn || ''];
          const payloadValue = typeof dependsOnValue === 'object' ? dependsOnValue?.value : dependsOnValue;

          const payload = {
            [control.formConfig.payloadKey || 'id']: payloadValue
          };
          service?.[apiMethod]?.(payload).subscribe((data: any) => {
            const labelKey = control.formConfig.labelKey || 'label';
            const valueKey = control.formConfig.valueKey || 'value';
            control.formConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
          });
        }

        // If the value is an object with `.value`, extract it
        this.form.controls[name].setValue(typeof value === 'object' && value !== null ? value.value : value);
      } else {
        this.form.controls[name].setValue(value);
      }
    });
  }


  clear() {
    this.form.reset();
  }

  getInputValue(input: any) {
    this.emitTextData.emit(input);
  }

  getSpecificCase(specificCaseData: any) {
    console.log(this.id);
    console.log(specificCaseData);
  }
 
}
