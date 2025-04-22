import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';
import { FormControlFactory } from '../../form-control.factory';

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

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService
  ) {
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });
    this.gstDetailsForm = this.fb.group({});
  }

  ngOnInit() {
    // console.log(this.controlConfig)
    this.initGstDetailsForm();
  }

  initGstDetailsForm() {
    const group: any = {};
    const fields = this.controlConfig.fields || [];

    for (const field of fields) {
      group[field.name] = FormControlFactory.createControl(field);
    }

    this.gstDetailsForm = this.fb.group(group);
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
    const claimedAmount = parseFloat(this.form.get(`${this.controlConfig.getControl}`)?.value || "0");
    const gstFieldNames = this.controlConfig.fields?.map((f: any)=> f.name).filter((name: any) => name !== 'GstIn' && name !== 'InvoiceNumber' && name !== 'Amount') || [];
    let gstBreakupAmount = 0;

    for (const name of gstFieldNames) {
      gstBreakupAmount += parseFloat(this.gstDetailsForm.get(name)?.value || "0");
    }

    if (gstBreakupAmount > 0 && gstBreakupAmount <= gstNum && gstNum > 0) {
      // Get all GST values
      this.gstDetails?.forEach((gst: any) => {
        gstAmount = Number(gstAmount) + Number(gst.Amount)
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
      // this.gstDetails.IsBillRaisedInCompanyGST = this.companyGSTForm.value.IsBillRaisedInCompanyGST;
      this.gstDetails.push(this.gstDetailsForm.value);
      this.control.setValue(this.gstDetails);
      this.gstDetailsForm.reset();
    }
  }

  removeGstRow(index: number): void {
    if (this.gstDetails.length > 0) {
      this.gstDetails.splice(index, 1);
    }
  }
}
