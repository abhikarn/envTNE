import { Component, EventEmitter, Input, Output, ViewEncapsulation, TemplateRef, Inject, Optional, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { DynamicFormService } from '../../../service/dynamic-form.service';

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
export class SelectInputComponent implements AfterViewInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Input() moduleData: any;
  @Input() formConfig: any;
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  disable: boolean = false;
  apiSubscription?: Subscription;
  isMobile = false;
  @Input() bottomSheet?: MatBottomSheet;

  @ViewChild('requestBottomSheet', { static: true }) requestBottomSheetTpl!: TemplateRef<any>;

  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? item?.value ?? index;
  }

  constructor(
    private dynamicFormService: DynamicFormService,
    private serviceRegistry: ServiceRegistryService,
    @Optional() private _bottomSheet?: MatBottomSheet
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngAfterViewInit() {
    // Assign bottomSheet if not provided via @Input
    if (!this.bottomSheet && this._bottomSheet) {
      this.bottomSheet = this._bottomSheet;
    }
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
    this.loadOptions();
    if (this.controlConfig.defaultValue) {
      this.control.setValue(this.controlConfig.defaultValue.Id);
    }

    if (this.controlConfig.disable) {
      this.control.disable();
    }

  }

  private loadOptions() {
    if ((!this.controlConfig.apiService && !this.controlConfig.apiMethod)) return;

    const apiService = this.serviceRegistry.getService(this.controlConfig.apiService || '');
    if (apiService && typeof apiService[this.controlConfig.apiMethod || ''] === 'function') {

      const payload = this.controlConfig.payloadKey ? this.controlConfig.payloadKey : null;
      if (this.controlConfig.payloadKey) {

      }
      if (payload && typeof payload === 'object') {
        this.apiSubscription = apiService[this.controlConfig.apiMethod || ''](payload).subscribe(
          (data: any) => {
            const labelKey = this.controlConfig.labelKey || 'label';
            const valueKey = this.controlConfig.valueKey || 'value';
            this.controlConfig.options = data.ResponseValue.map((item: any) => ({
              label: item[labelKey],
              value: item[valueKey]
            }));
          },
          (error: any) => {
            console.error('API Error:', error);
          }
        );
      }
      else {
        if (!this.controlConfig.payloadKey) {
          this.apiSubscription = apiService[this.controlConfig.apiMethod || '']().subscribe(
            (data: any) => {
              const labelKey = this.controlConfig.labelKey || 'label';
              const valueKey = this.controlConfig.valueKey || 'value';
              this.controlConfig.options = data.ResponseValue.map((item: any) => ({
                label: item[labelKey],
                value: item[valueKey]
              }));
            },
            (error: any) => {
              console.error('API Error:', error);
            }
          );
        }
      }
    } else {
      console.warn(`Invalid API service or method: ${this.controlConfig.apiService}.${this.controlConfig.apiMethod}`);
    }
  }

  getErrorMessage(status: boolean): string {
    if (!this?.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }

  // Emit selection change event
  onSelectionChange(event: any) {
    this.valueChange.emit({ event, control: this.controlConfig });
  }

  onReadonlySelection(event: MatSelectChange): void {
    if (this.controlConfig.readonly) {
      event.source.writeValue(this.controlConfig.value); // revert back to original
    }
  }

  // Only open bottom sheet on mobile, and prevent mat-select from opening
  onMatSelectClick(event: Event) {
    if (this.isMobile) {
      event.preventDefault();
      event.stopPropagation();
      this.openRequestBottomSheet();
      // Prevent mat-select from opening
      return false;
    }
    // For desktop, allow default behavior
    return true;
  }

  openRequestBottomSheet() {
    // Use the ViewChild template if @Input is not provided
    const tpl = this.requestBottomSheetTpl;
    if (this.bottomSheet && tpl) {
      this.bottomSheet.open(tpl, {
        panelClass: 'expense-bottom-sheet'
      });
    }
  }

  selectRequestFromSheet(option: any) {
    this.control.setValue(option.value);
    this.onSelectionChange({ value: option.value });
    if (this.bottomSheet) {
      this.bottomSheet.dismiss();
    }
  }

  getSelectedRequestLabel(): string {
    const value = this.control.value;
    const found = this.controlConfig.options?.find((r: any) => r.value === value);
    return found ? found.label : '';
  }

  onSelectOpenedChange(opened: boolean) {
    if (!opened) {
      // The dropdown has closed — treat this as blur
      this.onSelectBlur();
    }
  }

  onSelectBlur() {
    if (this.controlConfig.dependentCases) {
      this.controlConfig.dependentCases.forEach((caseItem: any) => {
        if (caseItem?.event == "onBlur" && caseItem?.payloadType === 'queryString') {
          this.dynamicFormService.handleBusinessCaseForQueryString(caseItem, this.form, this.moduleData, this.formConfig);
        }
      });
    }
  }
}
