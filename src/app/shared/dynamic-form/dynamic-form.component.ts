import { Component, OnInit, Input, Output, EventEmitter, Injector, Type, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFormControl, FormControlType } from './form-control.interface';
import { DynamicFormService } from './services/dynamic-form.service';
import { DynamicTableComponent } from '../component/dynamic-table/dynamic-table.component';
import { ServiceRegistryService } from '../service/service-registry.service';
import { ConfirmDialogService } from '../service/confirm-dialog.service';
import { GlobalConfigService } from '../service/global-config.service';
import { SnackbarService } from '../service/snackbar.service';
import { CommonModule } from '@angular/common';
import { DynamicFormControlFactory } from './factories/dynamic-form-control.factory';
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
  selectedRow: any;
  selectedFiles: any = [];
  private injector = inject(Injector);

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

  hasControlComponent(type: string | undefined): boolean {
    return type ? this.controlFactory.hasControlComponent(type as FormControlType) : false;
  }

  getControlComponent(type: string | undefined): Type<any> | null {
    return type ? this.controlFactory.getControlComponent(type as FormControlType) : null;
  }

  createInjector(control: any): Injector {
    return this.injector;
  }

  onEditRow(rowData: any): void {
    // Implementation
  }

  onDeleteRow(index: number): void {
    // Implementation
  }
}
