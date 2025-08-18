import { Component, Input } from '@angular/core';
import { IFormControl } from '../../form-control.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';
import { FormControlFactory } from '../../form-control.factory';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-quotation',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.scss'
})
export class QuotationComponent {
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() quotationData: any = [];
  quotationDetailsForm: FormGroup;
  quotationDetails: any = [];
  fields: any;
  notifications: any;

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private globalConfig: GlobalConfigService
  ) {
    this.quotationDetailsForm = this.fb.group({});
  }

  ngOnInit() {
    this.quotationDetails = this.quotationData;
    this.initQuotationDetailsForm();
  }

  initQuotationDetailsForm() {
    const group: any = {};
    if (this.controlConfig?.fields) {
      this.fields = this.controlConfig.fields || [];
      this.notifications = this.controlConfig.notifications;
    }

    if (this.controlConfig?.fields) {
      this.fields = this.controlConfig.fields || [];
      this.notifications = this.controlConfig.notifications;
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

    this.quotationDetailsForm = this.fb.group(group);
  }

  addQuotationRow(): void {

    if (this.quotationDetailsForm.invalid) {
      this.quotationDetailsForm.markAllAsTouched();
      return;
    }

    const newRow = this.quotationDetailsForm.value;
    this.quotationDetails.push(newRow);
    this.quotationDetailsForm.reset();
    this.snackbarService.success('Quotation row added successfully');
    this.initQuotationDetailsForm();
  }

  removeQuotationRow(index: number): void {
    if (this.control && this.quotationDetails.length > 0) {
      this.quotationDetails.splice(index, 1);
    }
    this.snackbarService.success('Quotation row removed successfully');}

  getValidationMessage(errors: any, fieldName: string): string {
    if (!errors) return '';

    const fieldConfig = this.fields.find((f: any) => f.name === fieldName);
    const validationMessages = fieldConfig?.validations || {};

    const errorKey = Object.keys(errors)[0];
    return validationMessages[errorKey] || 'Invalid value';
  }

  onBlur(field: any): void {
    if (!field.autoFormat) return;
    const control = this.quotationDetailsForm.get(field.name);
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
      this.quotationDetailsForm.get(field.name)?.setValue(inputValue, { emitEvent: false });
    }

    if(field.type == "file") {
      
    }

  }
}
