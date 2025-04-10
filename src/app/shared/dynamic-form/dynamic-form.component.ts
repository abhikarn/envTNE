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

  constructor() { }

  ngOnInit() {
    this.formConfig.forEach(config => {
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
    });

    this.existingData?.forEach((data: any) => {
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
            data.name = matchedOption
          }
        }
      });
    })
    this.tableData = this.existingData;
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
          referanceId: 0
        };
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
    console.log(this.formData)
    this.emitFormData.emit(this.formData);

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


    if(!this.editIndex) { //Create
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
    this.selectedRow = { ...rowData.row };
    console.log(this.selectedRow);
  
    this.formControls.forEach(control => {
      const { name, type } = control.formConfig;
  
      if (!this.form.controls[name]) return;
  
      const value = this.selectedRow[name];
  
      if (type === 'select') {
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

  getInputValue(inputValue: any) {
    this.emitTextData.emit(inputValue);
  }

  getSpecificCase(specificCaseData: any) {
    console.log(this.id);
    console.log(specificCaseData);
  }

}
