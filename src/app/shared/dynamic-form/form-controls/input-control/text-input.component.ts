import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, signal, computed, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IFormControl } from '../../form-control.interface';
import { CommonModule } from '@angular/common';
import { catchError, Observable, of, Subscription, take } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { FormControlFactory } from '../../form-control.factory';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { GlobalConfigService } from '../../../service/global-config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseFormControlComponent } from '../base-form-control.component';

@Component({
  selector: 'lib-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatOptionModule,
    FunctionWrapperPipe, MatIconModule],
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextInputComponent extends BaseFormControlComponent implements OnInit {
  @Input() override control: FormControl = new FormControl('');
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});
  @Output() override emitInputValue = new EventEmitter<any>();
  override displayValue = signal<any>(null);
  override isLoading = signal<boolean>(false);
  passwordVisible = signal<boolean>(false);
  override readonly destroyRef = inject(DestroyRef);

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService
  ) {
    super(serviceRegistry, snackbarService, configService);
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  override ngOnInit() {
    super.ngOnInit();

    if (this.controlConfig.disable) {
      this.control.disable();
    }

    if (this.controlConfig.autoComplete) {
      this.control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(inputValue => {
          this.validateSameOriginAndDestination();
          if (typeof inputValue !== "object") {
            if (typeof inputValue === 'string' && inputValue.length >= 2) {
              this.emitInputValue.emit({ inputValue, control: this.control });
              this.displayValue.set(inputValue);
            }
          }

        if (inputValue !== null && inputValue !== undefined && typeof inputValue === "object") {
          if (this.controlConfig.dependentCases?.length > 0) {
            this.controlConfig.dependentCases.forEach((dependentCase: any) => {
              if (dependentCase.event === "autoComplete") {
                this.handleDependentCase(dependentCase);
              }
            });
          }
        }
        });
    }
  }

  override handleValueChange(value: any): void {
    super.handleValueChange(value);
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

  onInput(event: any) {
    if (this.controlConfig.autoFormat) {
      let inputValue = (event.target.value).toString();
      const pattern = this.controlConfig.autoFormat?.patterns?.[0];
      if (pattern) {
        inputValue = inputValue.replace(new RegExp(pattern, 'g'), '');
      }

      const parts = inputValue.split('.');
      if (parts.length > 2) {
        inputValue = parts[0] + '.' + parts.slice(1).join('');
      }

      const [integerPart, decimalPart] = inputValue.split('.');
      const maxLength = this.controlConfig.autoFormat?.range?.max ?? 10;
      const decimalPrecision = Number(this.controlConfig.autoFormat?.decimalPrecision ?? 2);

      let formattedValue = integerPart ? integerPart.slice(0, maxLength) : '';
      if (decimalPart !== undefined) {
        formattedValue += '.' + decimalPart.slice(0, decimalPrecision);
      }

      // Set value without formatting to .00 etc. (formatting will be done onBlur)
      this.control.setValue(formattedValue);
    }
  }

  onCityAutoCompleteInput() {
    setTimeout(() => {
      let value = this.control.value;

      if (
        (this.controlConfig.name === 'Origin' || this.controlConfig.name === 'Destination') &&
        this.controlConfig.autoComplete &&
        Array.isArray(this.controlConfig.options)
      ) {
        const isValid =
          typeof value === 'object' &&
          value !== null &&
          this.controlConfig.options.some(
            (option: any) => option.value === value.value
          );
        setTimeout(() => {
          if (!isValid && value && value !== '') {
            this.control.setValue(null);
            this.snackbarService.error(`Please select a valid city from the list for ${this.controlConfig.label}.`);
            return;
          }
        }, 500);
      }
    }, 500);

  }

  onBlur() {
    let value = this.control.value;

    if (value === null || value === undefined || value === '') {
      this.control.setValue(this.getFormattedValue(0));
      return;
    }

    if (this.controlConfig.autoFormat) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const formatted = this.getFormattedValue(numericValue);
        this.control.setValue(formatted);
      }
    }

    if (this.controlConfig.dependentCases?.length > 0) {
      this.controlConfig.dependentCases.forEach((dependentCase: any) => {
        if (dependentCase.event === "onBlur") {
          this.handleDependentCase(dependentCase);
        }
      });
    }
  }

  private getFormattedValue(value: number | string): any {
    if (this.controlConfig.autoFormat) {
      const precision = this.controlConfig.autoFormat?.decimalPrecision
        ?? this.configService.getDecimalPrecision();

      const numeric = parseFloat(value as string);
      return isNaN(numeric) ? value.toString() : numeric.toFixed(precision);
    }
  }

  override trackByFn(index: number, item: any): string | number {
    return super.trackByFn(index, item);
  }

  override displayFn(option: any): string {
    return super.displayFn(option);
  }

  validateSameOriginAndDestination(): { [key: string]: boolean } | null {
    const origin = this.form.get('Origin')?.value;
    const destination = this.form.get('Destination')?.value;
    if (origin?.value && destination?.value && origin?.value === destination?.value) {
      this.snackbarService.error('Travel within the same city is not permitted for ticket claims');
      // reset both fields
      this.form.get('Origin')?.setValue(null);
      this.form.get('Destination')?.setValue(null);
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}