import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { ServiceRegistryService } from '../../service/service-registry.service';
import { SnackbarService } from '../../service/snackbar.service';
import { GlobalConfigService } from '../../service/global-config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  template: ''
})
export class BaseFormControlComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: FormGroup = new FormGroup({});
  @Output() emitInputValue = new EventEmitter<any>();

  // Common signals for all form controls
  displayValue = signal<any>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
 private destroyRef = inject(DestroyRef);
  constructor(
    protected serviceRegistry: ServiceRegistryService,
    protected snackbarService: SnackbarService,
    protected configService: GlobalConfigService
  ) {}

  ngOnInit() {
    this.initializeControl();
    this.setupSubscriptions();
  }

  protected initializeControl(): void {
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  protected setupSubscriptions(): void {
    // Subscribe to value changes
    this.control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.handleValueChange(value);
      });

    // Subscribe to status changes
    this.control.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => {
        this.handleStatusChange(status);
      });
  }

  protected handleValueChange(value: any): void {
    this.displayValue.set(value);
    this.emitInputValue.emit({ value, control: this.control });
  }

  protected handleStatusChange(status: string): void {
    if (status === 'INVALID' && this.control.touched) {
      this.errorMessage.set(this.getErrorMessage());
    } else {
      this.errorMessage.set('');
    }
  }

  protected getErrorMessage(): string {
    if (!this.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid input';
  }

  protected handleDependentCase(dependentCase: any): void {
    if (!dependentCase.apiService || !dependentCase.apiMethod) return;

    const apiService = this.serviceRegistry.getService(dependentCase.apiService);
    if (!apiService || typeof apiService[dependentCase.apiMethod] !== "function") return;

    let requestBody: any = dependentCase.requestBody;
    let shouldMakeApiCall = true;

    for (const [controlName, requestKey] of Object.entries(dependentCase.inputControls)) {
      if (typeof requestKey === 'string') {
        const controlValue = this.form.get(controlName)?.value;
        if (!controlValue) {
          this.snackbarService.error(`Please Select a ${controlName}.`);
          shouldMakeApiCall = false;
          break;
        }
        requestBody[requestKey] = controlValue[dependentCase.key] ?? controlValue;
      }
    }

    if (shouldMakeApiCall) {
      this.isLoading.set(true);
      apiService[dependentCase.apiMethod](requestBody)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (response: any) => {
            this.handleDependentResponse(response, dependentCase);
            this.isLoading.set(false);
          },
          error: (error: any) => {
            this.snackbarService.error(`Error: ${error.message}`);
            this.isLoading.set(false);
          }
        });
    }
  }

  protected handleDependentResponse(response: any, dependentCase: any): void {
    if (typeof dependentCase.outputControl === 'string') {
      const value = this.extractValueFromPath(response, dependentCase.outputControl);
      if (value !== undefined) {
        this.form.get(dependentCase.outputControl)?.setValue(value);
      }
    } else if (typeof dependentCase.outputControl === 'object') {
      for (const [outputControl, responsePath] of Object.entries(dependentCase.outputControl) as [string, string][]) {
        const value = this.extractValueFromPath(response, responsePath);
        if (value !== undefined) {
          if (dependentCase.autoFormat?.decimal) {
            this.form.get(outputControl)?.setValue(`${value}${dependentCase.autoFormat.decimal}`, { emitEvent: false });
          } else {
            this.form.get(outputControl)?.setValue(value, { emitEvent: false });
          }
        }
      }
    }
  }

  protected extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  protected trackByFn(index: number, item: any): string | number {
    return item?.id || index;
  }

  protected displayFn(option: any): string {
    return option?.label || '';
  }
} 