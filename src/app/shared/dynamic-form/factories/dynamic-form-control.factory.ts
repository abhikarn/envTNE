import { Injectable, Type } from '@angular/core';
import { TextInputComponent } from '../form-controls/input-control/text-input.component';
import { SelectInputComponent } from '../form-controls/dropdown/select-input.component';
import { DateInputComponent } from '../form-controls/calender/date-input.component';
import { TextAreaInputComponent } from '../form-controls/text-area/text-area-input.component';
import { MultiSelectInputComponent } from '../form-controls/multi-select/multi-select-input.component';
import { FileUploadComponent } from '../form-controls/file-upload/file-upload.component';
import { RadioInputComponent } from '../form-controls/radio/radio-input.component';
import { GstComponent } from '../form-controls/gst/gst.component';
import { CostCenterComponent } from '../form-controls/cost-center/cost-center.component';
import { FormControlType } from '../form-control.interface';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormControlFactory {
  private readonly controlMap: Partial<Record<FormControlType, Type<any>>> = {
    text: TextInputComponent,
    select: SelectInputComponent,
    'multi-select': MultiSelectInputComponent,
    date: DateInputComponent,
    radio: RadioInputComponent,
    costCenter: CostCenterComponent,
    gst: GstComponent,
    textarea: TextAreaInputComponent,
    file: FileUploadComponent,
    password: TextInputComponent,
    multiSelect: MultiSelectInputComponent,
    lineWiseCostCenter: CostCenterComponent,
    hidden: TextInputComponent,
    email: TextInputComponent
  };

  getControlComponent(type: FormControlType): Type<any> | null {
    return this.controlMap[type] || null;
  }

  hasControlComponent(type: FormControlType): boolean {
    return type in this.controlMap;
  }

  registerControl(type: FormControlType, component: Type<any>): void {
    this.controlMap[type] = component;
  }
} 