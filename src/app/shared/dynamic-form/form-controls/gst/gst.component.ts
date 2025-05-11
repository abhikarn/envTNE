import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';
import { AddGstComponent } from './add-gst/add-gst.component';

@Component({
  selector: 'app-gst',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    AddGstComponent
  ],
  templateUrl: './gst.component.html'
})
export class GstComponent {
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  gstData: any = [];
  companyGSTForm: FormGroup;
  options = [
    {
      "label": "Yes",
      "value": true
    },
    {
      "label": "No",
      "value": false
    }
  ]

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService
  ) {
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });
  }

  ngOnInit() { }

  trackByFn(index: number): any {
    return index;
  }

  setCompanyGSTFlag(value: boolean): void {
    this.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(value);
  }

}
