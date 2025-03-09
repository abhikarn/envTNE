import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl } from './form-control.interface';
import { CommonModule, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { TextInputComponent } from './form-controls/input-control/text-input.component';
import { SelectInputComponent } from './form-controls/dropdown/select-input.component';

@Component({
  selector: 'lib-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, TextInputComponent, SelectInputComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() formConfig: IFormControl[] = [];
  form: FormGroup = new FormGroup({});
  formControls: any[] = [];

  constructor() { }

  ngOnInit() {
    this.formConfig.forEach(config => {
      const control = FormControlFactory.createControl(config);
      this.formControls.push({ ...config, control: control });
      this.form.addControl(config.name, control);
    });
  }

  onSubmit() {
  }

}
