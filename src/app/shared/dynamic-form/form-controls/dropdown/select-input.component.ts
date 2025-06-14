import { Component, EventEmitter, Input, Output, ViewEncapsulation, TemplateRef, Optional, AfterViewInit, ViewChild, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { Subscription } from 'rxjs';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { BaseFormControlComponent } from '../base-form-control.component';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';

@Component({
  selector: 'lib-select-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FunctionWrapperPipe,
    MatIconModule
  ],
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SelectInputComponent extends BaseFormControlComponent implements AfterViewInit {
  @Input() override control: FormControl = new FormControl('');
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});
  @Output() override emitInputValue = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  
  override displayValue = signal<any>(null);
  override isLoading = signal<boolean>(false);
  disable: boolean = false;
  apiSubscription?: Subscription;
  isMobile = false;
  @Input() bottomSheet?: MatBottomSheet;

  @ViewChild('requestBottomSheet', { static: true }) requestBottomSheetTpl!: TemplateRef<any>;

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService,
    @Optional() private _bottomSheet?: MatBottomSheet
  ) {
    super(serviceRegistry, snackbarService, configService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.isMobile = window.innerWidth <= 768;
    this.loadOptions();
    if (this.controlConfig.defaultValue) {
      this.control.setValue(this.controlConfig.defaultValue.Id);
    }
  }

  ngAfterViewInit() {
    // Assign bottomSheet if not provided via @Input
    if (!this.bottomSheet && this._bottomSheet) {
      this.bottomSheet = this._bottomSheet;
    }
  }

  private loadOptions() {
    if ((!this.controlConfig.apiService && !this.controlConfig.apiMethod)) return;

    const apiService = this.serviceRegistry.getService(this.controlConfig.apiService || '');
    if (apiService && typeof apiService[this.controlConfig.apiMethod || ''] === 'function') {
      this.isLoading.set(true);
      const payload = this.controlConfig.payloadKey ? this.controlConfig.payloadKey : null;

      if (payload && typeof payload === 'object') {
        this.apiSubscription = apiService[this.controlConfig.apiMethod || ''](payload).subscribe({
          next: (data: any) => {
            const labelKey = this.controlConfig.labelKey || 'label';
            const valueKey = this.controlConfig.valueKey || 'value';
            this.controlConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
            this.isLoading.set(false);
          },
          error: (error: any) => {
            console.error('API Error:', error);
            this.snackbarService.error('Failed to load options');
            this.isLoading.set(false);
          }
        });
      } else {
        if (!this.controlConfig.payloadKey) {
          this.apiSubscription = apiService[this.controlConfig.apiMethod || '']().subscribe({
            next: (data: any) => {
              const labelKey = this.controlConfig.labelKey || 'label';
              const valueKey = this.controlConfig.valueKey || 'value';
              this.controlConfig.options = data.ResponseValue.map((item: any) => ({
                label: item[labelKey],
                value: item[valueKey]
              }));
              this.isLoading.set(false);
            },
            error: (error: any) => {
              console.error('API Error:', error);
              this.snackbarService.error('Failed to load options');
              this.isLoading.set(false);
            }
          });
        }
      }
    } else {
      console.warn(`Invalid API service or method: ${this.controlConfig.apiService}.${this.controlConfig.apiMethod}`);
    }
  }

  override handleValueChange(value: any): void {
    super.handleValueChange(value);
    this.valueChange.emit({ event: { value }, control: this.controlConfig });
  }

  override handleStatusChange(status: string): void {
    super.handleStatusChange(status);
  }

  override getErrorMessage(): string {
    return super.getErrorMessage();
  }

  override handleDependentCase(dependentCase: any): void {
    super.handleDependentCase(dependentCase);
  }

  override handleDependentResponse(response: any, dependentCase: any): void {
    super.handleDependentResponse(response, dependentCase);
  }

  override trackByFn(index: number, item: any): string | number {
    return item?.Key ?? item?.value ?? index;
  }

  override displayFn(option: any): string {
    return option?.label || '';
  }

  onReadonlySelection(event: MatSelectChange): void {
    if (this.controlConfig.readonly) {
      event.source.writeValue(this.controlConfig.value); // revert back to original
    }
  }

  onSelectionChange(event: MatSelectChange): void {
    this.handleValueChange(event.value);
    this.valueChange.emit({ event, control: this.controlConfig });
  }

  onMatSelectClick(event: Event) {
    if (this.isMobile) {
      event.preventDefault();
      event.stopPropagation();
      this.openRequestBottomSheet();
      return false;
    }
    return true;
  }

  openRequestBottomSheet() {
    const tpl = this.requestBottomSheetTpl;
    if (this.bottomSheet && tpl) {
      this.bottomSheet.open(tpl, {
        panelClass: 'expense-bottom-sheet'
      });
    }
  }

  selectRequestFromSheet(option: any) {
    this.control.setValue(option.value);
    this.handleValueChange(option.value);
    if (this.bottomSheet) {
      this.bottomSheet.dismiss();
    }
  }

  getSelectedRequestLabel(): string {
    const value = this.control.value;
    const found = this.controlConfig.options?.find((r: any) => r.value === value);
    return found ? found.label : '';
  }
}
