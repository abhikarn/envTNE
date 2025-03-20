import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';

@Component({
  selector: 'app-gst',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule
  ],
  templateUrl: './gst.component.html'
})
export class GstComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  companyGSTForm: FormGroup;
  gstDetailsForm: FormGroup;
  gstDetails: any = {
    data: []
  };
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

  constructor(private fb: FormBuilder) {
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });
    this.gstDetailsForm = this.fb.group({
      GstIn: ['', Validators.required],
      InvoiceNumber: ['', Validators.required],
      Amount: ['', [Validators.required, Validators.min(0)]],
      SGST: ['', Validators.required],
      CGST: ['', Validators.required],
      IGST: ['', Validators.required],
      UGST: ['', Validators.required]
    });
  }


  trackByFn(index: number): any {
    return index;
  }

  addGstRow(): void {
    this.gstDetails.IsBillRaisedInCompanyGST = this.companyGSTForm.value.IsBillRaisedInCompanyGST;
    this.gstDetails.data.push(this.gstDetailsForm.value);
    this.control.setValue(this.gstDetails);
    this.gstDetailsForm.reset();
  }

  removeGstRow(index: number): void {
    if (this.gstDetails.length > 1) {
      this.gstDetails.splice(index, 1);
    }
  }
}
