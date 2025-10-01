import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFormControl } from '../../../form-control.interface';
import { SnackbarService } from '../../../../service/snackbar.service';
import { GlobalConfigService } from '../../../../service/global-config.service';
import { CommonModule } from '@angular/common';
import { FormControlFactory } from '../../../form-control.factory';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, switchMap, take } from 'rxjs/operators';
import { DataService, ExpenseService } from '../../../../../../../tne-api';

@Component({
  selector: 'app-line-wise-cost-center',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule
  ],
  templateUrl: './line-wise-cost-center.component.html',
  styleUrl: './line-wise-cost-center.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class LineWiseCostCenterComponent {
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Input() amount: any;
  @Input() ExpenseRequestDetailId: any = 0;
  @Input() costCenterData: any = [];
  @Input() costcentreWiseExpense: any = [];
  costCenterDetailsForm: FormGroup;
  costCenterDetails: any = [];
  fields: any;
  notifications: any;
  filteredOptionsMap: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private globalConfig: GlobalConfigService,
    private dataService: DataService,
    private expenseService: ExpenseService
  ) {
    this.costCenterDetailsForm = this.fb.group({});
  }

  ngOnInit() {
    console.log(this.costCenterData)
    this.costCenterDetails = this.costCenterData;
    this.initCostCenterDetailsForm();
  }

  initCostCenterDetailsForm() {
    const group: any = {};
    if (this.controlConfig?.fields) {
      this.fields = this.controlConfig.fields || [];
      this.notifications = this.controlConfig.notifications;
    }

    if (this.costcentreWiseExpense?.fields) {
      this.fields = this.costcentreWiseExpense.fields || [];
      this.notifications = this.costcentreWiseExpense.notifications;
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

    this.costCenterDetailsForm = this.fb.group(group);
    this.initAutoCompleteFields();
  }

  initAutoCompleteFields() {
    this.fields.forEach((field: any) => {
      if (field.autoComplete) {
        const control = this.costCenterDetailsForm.get(field.name);
        if (!control) return;
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
        control.valueChanges
          .pipe(
            debounceTime(300),
            switchMap(searchText => {
              // Only call API if searchText is a string (not an object)
              if (typeof searchText === 'string') {
                return this.dataService.dataGetCostCentreAutocomplete({ SearchText: searchText || '' });
              }
              // Otherwise, return empty array (no API call)
              return [];
            })
          )
          .subscribe({
            next: (res: any) => {
              const labelKey = field.labelKey || 'label';
              const valueKey = field.valueKey || 'value';
              this.filteredOptionsMap[field.name] = res?.ResponseValue?.map((option: any) => ({
                label: option[labelKey],
                value: option[valueKey]
              }))
              console.log(`Filtered options for ${field.name}:`, this.filteredOptionsMap[field.name]);
            },
            error: (err: any) => {
              console.error('Failed to fetch cost centres', err);
              this.filteredOptionsMap[field.name] = [];
            }
          });
      }
    });
  }

  onOptionSelected(event: any, item: any) {
    const selected = event.option.value;
    this.costCenterDetailsForm.get('CostCentreId')?.setValue(selected.value, { emitEvent: false });
    this.costCenterDetailsForm.get('CostCentre')?.setValue(selected.label, { emitEvent: false });
  }

  addCostCenterRow() {
    if (this.costCenterDetailsForm.invalid) {
      this.costCenterDetailsForm.markAllAsTouched();
      return;
    }

    // do not allow 0 value in AmmoutInActual & AmmoutInPercentage
    if (this.costCenterDetailsForm.get('AmmoutInActual')?.value <= 0 && this.costCenterDetailsForm.get('AmmoutInPercentage')?.value <= 0) {
      this.snackbarService.error('Amount in Actual or Percentage must be greater than 0');
      return;
    }

    // user can not select duplicate cost center
    const costCentreId = this.costCenterDetailsForm.get('CostCentreId')?.value;
    if (this.costCenterDetails.some((detail: any) => detail.CostCentreId === costCentreId)) {
      this.snackbarService.error('Cost center already exists');
      return;
    }

    let amount: any
    if (this.controlConfig?.getControl) {
      amount = parseFloat(this.form.get(`${this.controlConfig.getControl}`)?.value || "0");
    }

    if (this.costcentreWiseExpense?.getControl) {
      amount = parseFloat(this.amount || 0)
    }

    // Sum of All AmountInActual should not exceed Claimed Amount
    const totalAmount = this.costCenterDetails.reduce((sum: number, detail: any) => {
      return sum + (parseFloat(detail.AmmoutInActual) || 0);
    }, 0);

    if (totalAmount + parseFloat(this.costCenterDetailsForm.get('AmmoutInActual')?.value || "0") > amount) {
      this.snackbarService.error('Sum of all cost center amounts must be equal to the claimed amount.');
      return;
    }
    // Total of AmmoutInPercentage should not exceed 100%
    const totalPercentage = this.costCenterDetails.reduce((sum: number, detail: any) => {
      return sum + (parseFloat(detail.AmmoutInPercentage) || 0);
    }, 0);

    if (totalPercentage + parseFloat(this.costCenterDetailsForm.get('AmmoutInPercentage')?.value || "0") > 100) {
      this.snackbarService.error('Total cost center percentage exceeds 100%');
      return;
    }

    this.fields.forEach((field: any) => {
      if (field?.dataType == 'numeric' && this.costCenterDetailsForm.value.hasOwnProperty(field.name)) {
        if (this.costCenterDetailsForm.value[field.name] === null || this.costCenterDetailsForm.value[field.name] === undefined) {
          this.costCenterDetailsForm.value[field.name] = 0;
        }
        const precision = field.autoFormat?.decimalPrecision || this.globalConfig.getDecimalPrecision();
        this.costCenterDetailsForm.value[field.name] = parseFloat(this.costCenterDetailsForm.value[field.name]).toFixed(precision);
      }
    });
    this.costCenterDetails.push(this.costCenterDetailsForm.value);
    if (this.control) {
      this.control.setValue(this.costCenterDetails);
    } else {
      console.log(this.costCenterDetailsForm.value);
      this.costCenterDetailsForm.value.ExpenseRequestDetailId = this.ExpenseRequestDetailId;
      let requestBody = {
        Id: this.costCenterDetailsForm.value.ExpenseRequestCostCentrewiseAmmoutId,
        AmountInPercentage: this.costCenterDetailsForm.value.AmmoutInPercentage,
        AmountInActual: this.costCenterDetailsForm.value.AmmoutInActual,
        CostCentreId: this.costCenterDetailsForm.value.CostCentreId,
        ExpenseRequestDetailId: this.ExpenseRequestDetailId
      }
      this.expenseService.expenseExpenseRequestCostCentrewiseAmountIu(requestBody).pipe(take(1)).subscribe({
        next: (res: any) => {
          this.snackbarService.success(res?.ResponseValue?.Message);
        }
      });
    }
    this.initCostCenterDetailsForm();
  }

  removeCostCenterRow(index: number) {
    if (this.control && this.costCenterDetails.length > 0) {
      this.costCenterDetails.splice(index, 1);
    }
    if (!this.control) {
      console.log(this.costCenterDetails[index]);
      this.expenseService.expenseExpenseRequestCostCentrewiseAmountDelete(
        {
          Id: this.costCenterDetails[index]?.ExpenseRequestCostCentrewiseAmmoutId || 0,
          ExpenseRequestDetailId: this.costCenterDetails[index]?.ExpenseRequestDetailId || 0
        }
      ).pipe(take(1)).subscribe({
        next: (res: any) => {
          this.snackbarService.success(res?.ResponseValue?.Message);
          this.costCenterDetails.splice(index, 1);
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
    const control = this.costCenterDetailsForm.get(field.name);
    const raw = control?.value;
    if (raw == null || raw === '') return;

    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const precision = field.autoFormat.decimalPrecision;
      control?.setValue(num.toFixed(precision), { emitEvent: false });
    }
  }

  onInput(event: any, field: any) {

    if (field?.autoFormat?.range) {
      const inputValue = event.target.value.toString();
      if (inputValue.length > field.autoFormat.range.max) {
        this.snackbarService.error(`Maximum length is ${field.autoFormat.range.max} characters`);
        this.costCenterDetailsForm.get(field.name)?.setValue(inputValue.substring(0, field.autoFormat.range.max), { emitEvent: false });
        return;
      }
    }

    let amount: any
    if (this.controlConfig?.getControl) {
      amount = parseFloat(this.form.get(`${this.controlConfig.getControl}`)?.value || "0");
    }

    if (this.costcentreWiseExpense?.getControl) {
      amount = parseFloat(this.amount || 0)
    }

    if (!(amount > 0)) {
      this.snackbarService.error('Please enter a Claimed amount');
      this.costCenterDetailsForm.get(field.name)?.setValue('', { emitEvent: false });
      return;
    }

    if (field.name == 'AmmoutInPercentage') {
      this.costCenterDetailsForm.get('AmmoutInActual')?.setValue((amount * (parseFloat(event.target.value) / 100)).toFixed(2), { emitEvent: false });
    }

    if (field.name == 'AmmoutInActual') {
      this.costCenterDetailsForm.get('AmmoutInPercentage')?.setValue((parseFloat(event.target.value) / amount * 100).toFixed(2), { emitEvent: false });
    }

    if (field?.autoFormat) {
      let inputValue = (event.target.value).toString();
      field.autoFormat.patterns?.forEach((pattern: any) => {
        inputValue = inputValue.replace(new RegExp(pattern), '');
      })
      if (inputValue.length > field.autoFormat.range.max) {
        inputValue = inputValue.substring(0, field.autoFormat.range.max);
      }
      this.costCenterDetailsForm.get(field.name)?.setValue(inputValue, { emitEvent: false });
    }
  }
}
