import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, AfterViewInit, AfterViewChecked, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';
import { AddGstComponent } from './add-gst/add-gst.component';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { GlobalConfigService } from '../../../service/global-config.service';
import { FormControlService } from '../../services/form-control.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-gst',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    AddGstComponent
  ],
  templateUrl: './gst.component.html',
  styleUrls: ['./gst.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GstComponent extends BaseFormControlComponent implements AfterViewInit, AfterViewChecked {  
  @ViewChild(AddGstComponent) addGstComponentRef!: AddGstComponent;
  @Input() override control: FormControl = new FormControl('');
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});
  @Output() override emitInputValue = new EventEmitter<any>();
  
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

  private pendingGstDetails: any = null;

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService,
    private fb: FormBuilder,
    private formControlService: FormControlService
  ) {
    super(serviceRegistry, snackbarService, configService);
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });

    // Subscribe to form changes for future service-based approach
    this.companyGSTForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.formControlService.setGstData(value);
      });
  }

  override ngOnInit() {
    super.ngOnInit();
    console.log(localStorage.getItem('ocrResult'));
    if (localStorage.getItem('ocrResult') === 'true') {
      this.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(true);
    }
    this.setupGstSubscriptions();
  }

  private setupGstSubscriptions(): void {
    // Subscribe to form value changes
    this.companyGSTForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.formControlService.setGstData(value);
      });
  }

  override trackByFn(index: number, item: any): string | number {
    return item?.id || index;
  }

  setCompanyGSTFlag(value: boolean): void {
    this.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(value);
  }

  setGstDetailsFromOcr(gstDetails: any) {
    this.gstData = gstDetails;
    this.pendingGstDetails = gstDetails;
    // Try to set immediately if child is available
    if (this.addGstComponentRef) {
      this.addGstComponentRef.setGstDetails(gstDetails);
      this.pendingGstDetails = null;
    }
  }

  ngAfterViewInit() {
    // Set GST details if they were received before child was available
    if (this.pendingGstDetails && this.addGstComponentRef) {
      this.addGstComponentRef.setGstDetails(this.pendingGstDetails);
      this.pendingGstDetails = null;
    }
  }

  ngAfterViewChecked() {
    // Defensive: in case child appears after a change
    if (this.pendingGstDetails && this.addGstComponentRef) {
      this.addGstComponentRef.setGstDetails(this.pendingGstDetails);
      this.pendingGstDetails = null;
    }
  }
}
