import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { IFormControl } from '../../form-control.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../service/snackbar.service';
import { LineWiseCostCenterComponent } from "./line-wise-cost-center/line-wise-cost-center.component";
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-cost-center',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    LineWiseCostCenterComponent
  ],
  templateUrl: './cost-center.component.html',
  styleUrl: './cost-center.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CostCenterComponent {
  @ViewChild(LineWiseCostCenterComponent) lineWiseCostCenterRef!: LineWiseCostCenterComponent;
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  costCenterData: any = [];
  costCenterForm: FormGroup;
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
    this.costCenterForm = this.fb.group({
      IsBillRaisedInMultipleCostCenter: [false, Validators.required]
    });
  }

  trackByFn(index: number): any {
    return index;
  }

  setMultipleCostCenterFlag(value: boolean): void {
    this.costCenterForm.get('IsBillRaisedInMultipleCostCenter')?.setValue(value);
  }

  getLineWiseCostCenterRef(): LineWiseCostCenterComponent {
    return this.lineWiseCostCenterRef;
  }

}
