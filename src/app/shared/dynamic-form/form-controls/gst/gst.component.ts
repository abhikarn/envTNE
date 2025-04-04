import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';

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
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
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

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService
  ) {
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });
    this.gstDetailsForm = this.fb.group({
      GstIn: ['', [Validators.required, this.validateGST]],
      InvoiceNumber: ['', Validators.required],
      Amount: ['', [Validators.required, Validators.min(0)]],
      SGST: ['', Validators.required],
      CGST: ['', Validators.required],
      IGST: ['', Validators.required],
      UGST: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  trackByFn(index: number): any {
    return index;
  }

  validateGST(control: FormControl) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const gstNumber = control.value?.toUpperCase().trim();
    return gstRegex.test(gstNumber) ? null : { invalidGST: true };
  }

  validateGSTWithClaimed() {
    let isValidGst = false;
    let gstAmount = 0;
    const gstNum = parseFloat(this.gstDetailsForm.get('Amount')?.value || "0");
    const sgst = parseFloat(this.gstDetailsForm.get('SGST')?.value || "0");
    const cgst = parseFloat(this.gstDetailsForm.get('CGST')?.value || "0");
    const igst = parseFloat(this.gstDetailsForm.get('IGST')?.value || "0");
    const utgst = parseFloat(this.gstDetailsForm.get('UGST')?.value || "0");
    const claimedAmount = parseFloat(this.form.get('Amount')?.value || "0");
    const gstBreakupAmount = sgst + cgst + igst + utgst;

    if (gstBreakupAmount > 0 && gstBreakupAmount <= gstNum && gstNum > 0) {
      // Get all GST values
      this.gstDetails.data?.forEach((gst: any) => {
        gstAmount = gstAmount + gst.Amount
      })
      if (claimedAmount > 0) {
        if (gstNum > 0) {
          if (gstAmount + gstNum > claimedAmount) {
            this.snackbarService.error("The GST amount should not be greater than the claimed amount.");
          } else {
            isValidGst = true;
          }
        } else {
          this.snackbarService.error("Please enter a valid GST amount.");
        }
      } else {
        this.snackbarService.error("Please enter a claimed amount.");
      }
    } else {
      this.snackbarService.error("Please enter a valid GST amount.");
    }
    return isValidGst;
  }

  addGstRow(): void {
    if (this.validateGSTWithClaimed()) {
      this.gstDetails.IsBillRaisedInCompanyGST = this.companyGSTForm.value.IsBillRaisedInCompanyGST;
      this.gstDetails.data.push(this.gstDetailsForm.value);
      this.control.setValue(this.gstDetails);
      this.gstDetailsForm.reset();
    }
  }

  removeGstRow(index: number): void {
    if (this.gstDetails.data.length > 1) {
      this.gstDetails.data.splice(index, 1);
    }
  }
}
