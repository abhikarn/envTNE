import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

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
  companyGSTForm: FormGroup;
  gstDetailsForm: FormGroup;
  gstDetails: any = [];
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
    this.companyGSTForm = this.gstDetailsForm = this.fb.group({
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
    this.gstDetails.push(this.gstDetailsForm.value);
    this.gstDetailsForm.reset();
  }

  removeGstRow(index: number): void {
    if (this.gstDetails.length > 1) {
      this.gstDetails.splice(index, 1);
    }
  }
}
