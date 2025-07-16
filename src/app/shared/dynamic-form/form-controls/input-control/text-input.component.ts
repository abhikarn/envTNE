import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
export class TextInputComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Output() emitInputValue = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  @Output() emitBusinessCaseData = new EventEmitter<any>();
  displayValue: any;
  passwordVisible: boolean = false;

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private snackbarService: SnackbarService,
    private configService: GlobalConfigService
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    this.control.valueChanges.subscribe(inputValue => {
      if (inputValue) {
        this.valueChange.emit({
          event: inputValue,
          control: this.controlConfig
        });
        if (this.controlConfig.readonly) {
          if (this.controlConfig.dependentCases?.length > 0) {
            this.controlConfig.dependentCases.forEach((dependentCase: any) => {
              if (dependentCase.event === "onBlur") {
                this.handleBusinessCase(dependentCase);
              }
            });
          }
        }
      }
    });

    if (this.controlConfig.disable) {
      this.control.disable();
    }

    if (this.controlConfig.autoComplete) {
      this.control.valueChanges.subscribe(inputValue => {
        this.validateSameOriginAndDestination();
        if (typeof inputValue !== "object") {
          // Trigger only when inputValue is a string of exactly 2 characters
          if (typeof inputValue === 'string' && inputValue.length >= 2) {
            let input = {
              inputValue: inputValue,
              control: this.control
            }
            this.emitInputValue.emit(input);
            this.displayValue = inputValue;
          }
        }

        if (inputValue !== null && inputValue !== undefined && typeof inputValue === "object") {
          if (this.controlConfig.dependentCases?.length > 0) {
            this.controlConfig.dependentCases.forEach((dependentCase: any) => {
              if (dependentCase.event === "autoComplete") {
                this.handleBusinessCase(dependentCase);
              }
            });
          }
        }
      });
    }
  }

  onInput(event: any) {
    if (this.controlConfig.autoFormat) {
      let inputValue = (event.target.value).toString();
      // Correctly apply the pattern as a RegExp
      const pattern = this.controlConfig.autoFormat?.patterns[0];
      if (pattern) {
        inputValue = inputValue.replace(new RegExp(pattern, 'g'), '');
      }

      // Prevent more than one decimal point
      const parts = inputValue.split('.');
      if (parts.length > 2) {
        inputValue = parts[0] + '.' + parts.slice(1).join('');
      }

      // Limit integer and decimal part lengths
      const [integerPart, decimalPart] = inputValue.split('.');
      let maxLength = this.controlConfig.autoFormat.range?.max ?? 10;
      let decimalPrecision = Number(this.controlConfig.autoFormat.decimalPrecision ?? 2);

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
          // Only show error if user typed something (not empty/null/undefined)
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

    // Handle empty or null input: set to 0 with precision
    if (value === null || value === undefined || value === '') {
      this.control.setValue(this.getFormattedValue(0));
      return;
    }

    // Format value to required decimal precision on blur
    if (this.controlConfig.autoFormat) {
      // Only format if value is a valid number
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const formatted = this.getFormattedValue(numericValue);
        this.control.setValue(formatted);
      }
    }

    // Handle dependent cases if any
    if (this.controlConfig.dependentCases?.length > 0) {
      this.controlConfig.dependentCases.forEach((dependentCase: any) => {
        if (dependentCase.event === "onBlur") {
          this.handleBusinessCase(dependentCase);
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

  handleBusinessCase(businessCaseData: any) {
    this.emitBusinessCaseData.emit(businessCaseData);
  }

  /**
   * Extracts a nested value from an object using a dot-separated path.
   * Example: extractValueFromPath({ ResponseValue: { Value: 1 } }, "ResponseValue.Value") => 1
   */
  private extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? index;
  }

  getErrorMessage(status: boolean): string {
    if (!this.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (
        (validation.type && this.control.hasError(validation.type)) ||
        (validation.subType && this.control.hasError(validation.subType))
      ) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }

  displayFn(option: any): string {
    return option ? option.label : '';
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


}