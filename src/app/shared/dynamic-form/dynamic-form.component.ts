import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl } from './form-control.interface';

import { TextInputComponent } from './form-controls/input-control/text-input.component';
import { SelectInputComponent } from './form-controls/dropdown/select-input.component';
import { DateInputComponent } from './form-controls/date/date-input.component';
import { TextAreaInputComponent } from './form-controls/text-area/text-area-input.component';
import { MultiSelectInputComponent } from './form-controls/multi-select/multi-select-input.component';
import { FileUploadComponent } from './form-controls/file-upload/file-upload.component';
import { DynamicTableComponent } from '../component/dynamic-table/dynamic-table.component';


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
    DynamicTableComponent
],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() formConfig: IFormControl[] = [];
  @Input() eventHandler: any;
  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  tableData: any = [];
  selectedRow: any;

  constructor() { }

  ngOnInit() {
    this.formConfig.forEach(config => {
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);
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
    console.log(this.form)
    console.log(Object.keys(this.form.controls))
    this.tableData.push(this.form.value);
    this.form.reset();
  }

  onEditRow(row: any) {
    console.log(row)
    this.selectedRow = { ...row }; // Pass selected row to form
    Object?.keys(this.selectedRow).forEach(key => {
      if (this.form.controls[key]) {
        this.form.controls[key].setValue(this.selectedRow[key]); // Set values from selected row
      }
    });
  }

}
