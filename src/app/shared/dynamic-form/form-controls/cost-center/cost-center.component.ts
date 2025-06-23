import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';
import { LineWiseCostCenterComponent } from "./line-wise-cost-center/line-wise-cost-center.component";
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { GlobalConfigService } from '../../../service/global-config.service';
import { FormControlService } from '../../services/form-control.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cost-center',
  standalone: true,
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
export class CostCenterComponent extends BaseFormControlComponent {
  @Input() override control: FormControl = new FormControl('');
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});
  
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
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService,
    private fb: FormBuilder,
    private formControlService: FormControlService
  ) {
    super(serviceRegistry, snackbarService, configService);
    this.costCenterForm = this.fb.group({
      IsBillRaisedInMultipleCostCenter: [false, Validators.required]
    });

    // Subscribe to form changes for future service-based approach
    this.costCenterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.formControlService.setCostCenterData(value);
      });
  }

  override trackByFn(index: number): string | number {
    return index;
  }

  setMultipleCostCenterFlag(value: boolean): void {
    this.costCenterForm.get('IsBillRaisedInMultipleCostCenter')?.setValue(value);
  }
}
