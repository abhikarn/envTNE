import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, Injector, Type, inject, signal, computed, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlFactory } from './form-control.factory';
import { IFormControl, FormControlType } from './form-control.interface';
import { DynamicFormService } from './services/dynamic-form.service';
import { DynamicTableComponent } from '../component/dynamic-table/dynamic-table.component';
import { ServiceRegistryService } from '../service/service-registry.service';
import { ConfirmDialogService } from '../service/confirm-dialog.service';
import { GlobalConfigService } from '../service/global-config.service';
import { SnackbarService } from '../service/snackbar.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DynamicFormControlFactory } from './factories/dynamic-form-control.factory';
import { CostCenterComponent } from './form-controls/cost-center/cost-center.component';
import { GstComponent } from './form-controls/gst/gst.component';
import { TextInputComponent } from './form-controls/input-control/text-input.component';
import { SelectInputComponent } from './form-controls/dropdown/select-input.component';
import { MultiSelectInputComponent } from './form-controls/multi-select/multi-select-input.component';
import { DateInputComponent } from './form-controls/calender/date-input.component';
import { RadioInputComponent } from './form-controls/radio/radio-input.component';
import { TextAreaInputComponent } from './form-controls/text-area/text-area-input.component';
import { FileUploadComponent } from './form-controls/file-upload/file-upload.component';
import { DynamicFormBaseComponent } from './dynamic-form-base.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent extends DynamicFormBaseComponent {
  @ViewChild(CostCenterComponent) costCenterComponentRef!: CostCenterComponent;
  @ViewChild(GstComponent) gstComponentRef!: GstComponent;

  // Only custom outputs or properties unique to this component
  selectedRow: any;
  selectedFiles: any = [];

  constructor(
    serviceRegistry: ServiceRegistryService,
    private confirmDialogService: ConfirmDialogService,
    private configService: GlobalConfigService,
    snackbarService: SnackbarService,
    private dynamicFormService: DynamicFormService,
    private controlFactory: DynamicFormControlFactory
  ) {
    super(serviceRegistry, snackbarService);
  }

  // Only custom methods or overrides below
}
