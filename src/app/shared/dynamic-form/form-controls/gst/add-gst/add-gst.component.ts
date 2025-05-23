import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../../form-control.interface';
import { SnackbarService } from '../../../../service/snackbar.service';
import { FormControlFactory } from '../../../form-control.factory';
import { FinanceService } from '../../../../../../../tne-api';
import { take } from 'rxjs';
import { GlobalConfigService } from '../../../../service/global-config.service';

@Component({
  selector: 'app-add-gst',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-gst.component.html',
  styleUrl: './add-gst.component.scss'
})
export class AddGstComponent {
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Input() categoryGST: any;
  @Input() amount: any;
  @Input() ExpenseRequestDetailId: any;
  @Input() gstData: any = [];
  gstDetailsForm: FormGroup;
  gstDetails: any = [];
  fields: any;
  notifications: any;

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private financeService: FinanceService,
    private globalConfig: GlobalConfigService
  ) {
    this.gstDetailsForm = this.fb.group({});
  }

  ngOnInit() {
    this.gstDetails = this.gstData;
    this.initGstDetailsForm();
  }

  initGstDetailsForm() {
    const group: any = {};
    if (this.controlConfig?.fields) {
      this.fields = this.controlConfig.fields || [];
      this.notifications = this.controlConfig.notifications;
    }

    if (this.categoryGST?.fields) {
      this.fields = this.categoryGST.fields || [];
      this.notifications = this.categoryGST.notifications;
    }

    // Apply global decimalPrecision to fields lacking explicit setting
    const globalPrecision = this.globalConfig.getDecimalPrecision();
    this.fields.forEach((field: any) => {
      if (field.autoFormat) {
        // Use existing or fallback precision
        field.autoFormat.decimalPrecision = field.autoFormat.decimalPrecision ?? globalPrecision;
      }
    });

    for (const field of this.fields) {
      group[field.name] = FormControlFactory.createControl(field);
    }

    this.gstDetailsForm = this.fb.group(group);
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
    let amount: any
    if (this.controlConfig?.getControl) {
      amount = parseFloat(this.form.get(`${this.controlConfig.getControl}`)?.value || "0");
    }
    if (this.categoryGST?.getControl) {
      amount = parseFloat(this.amount || 0)
    }

    const gstFieldNames = this.fields?.map((f: any) => f.name).filter((name: any) => name !== 'GstIn' && name !== 'InvoiceNumber' && name !== 'Amount') || [];
    let gstBreakupAmount = 0;

    for (const name of gstFieldNames) {
      gstBreakupAmount += parseFloat(this.gstDetailsForm.get(name)?.value || "0");
    }

    if (gstBreakupAmount >= 0 && gstBreakupAmount <= gstNum && gstNum >= 0) {
      // Get all GST values
      this.gstDetails?.forEach((gst: any) => {
        gstAmount = Number(gstAmount) + Number(gst.Amount)
      })
      if (amount > 0) {
        if (gstNum > 0) {
          if (gstAmount + gstNum > amount) {
            this.snackbarService.error(this.notifications.GSTAmount);
          } else {
            isValidGst = true;
          }
        } else {
          this.snackbarService.error(this.notifications.validGSTAmount);
        }
      } else {
        this.snackbarService.error(this.notifications.claimedAmount);
      }
    } else {
      this.snackbarService.error(this.notifications.validGSTAmount);
    }
    return isValidGst;
  }

  addGstRow(): void {
    if (this.gstDetailsForm.invalid) {
      this.gstDetailsForm.markAllAsTouched();
      return;
    }
    if (this.validateGSTWithClaimed()) {
      // this.gstDetails.IsBillRaisedInCompanyGST = this.companyGSTForm.value.IsBillRaisedInCompanyGST;
      this.gstDetails.push(this.gstDetailsForm.value);
      if (this.control) {
        this.control.setValue(this.gstDetails);
      } else {
        console.log(this.gstDetailsForm.value);
        this.gstDetailsForm.value.ExpenseRequestDetailId = this.ExpenseRequestDetailId;
        this.financeService.financeExpenseRequestGstIu(this.gstDetailsForm.value).pipe(take(1)).subscribe({
          next: (res: any) => {
            this.snackbarService.success(res?.ResponseValue?.Message);
          }
        });
      }
      this.initGstDetailsForm();
    }
  }

  removeGstRow(index: number): void {
    if (this.control && this.gstDetails.length > 0) {
      this.gstDetails.splice(index, 1);
    }
    if (!this.control) {
      this.financeService.financeExpenseRequestGstRemove({ ExpenseRequestGstId: this.gstDetails[index]?.ExpenseRequestGstId || 0 }).pipe(take(1)).subscribe({
        next: (res: any) => {
          this.snackbarService.success(res?.ResponseValue?.Message);
          this.gstDetails.splice(index, 1);
        }
      })
    }
  }

  getValidationMessage(errors: any, fieldName: string): string {
    if (!errors) return '';

    const fieldConfig = this.fields.find((f: any) => f.name === fieldName);
    const validationMessages = fieldConfig?.validations || {};

    const errorKey = Object.keys(errors)[0];
    return validationMessages[errorKey] || 'Invalid value';
  }

  onBlur(field: any): void {
    if (!field.autoFormat) return;
    const control = this.gstDetailsForm.get(field.name);
    const raw = control?.value;
    if (raw == null || raw === '') return;

    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const precision = field.autoFormat.decimalPrecision;
      control?.setValue(num.toFixed(precision), { emitEvent: false });
    }
  }

  onInput(event: any, field: any) {
    if (field?.autoFormat) {
      let inputValue = (event.target.value).toString();
      field.autoFormat.patterns?.forEach((pattern: any) => {
        inputValue = inputValue.replace(new RegExp(pattern), '');
      })
      if (inputValue.length > field.autoFormat.range.max) {
        inputValue = inputValue.substring(0, field.autoFormat.range.max);
      }
      this.gstDetailsForm.get(field.name)?.setValue(inputValue, { emitEvent: false });
    }
  }

}
