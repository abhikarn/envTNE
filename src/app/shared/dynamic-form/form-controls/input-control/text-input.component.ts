import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  templateUrl: './text-input.component.html'
})
export class TextInputComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Output() emitInputValue = new EventEmitter<any>();
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
    if (this.controlConfig.disable) {
      this.control.disable();
    }

    if (this.controlConfig.autoComplete) {
      this.control.valueChanges.subscribe(inputValue => {
        this.validateSameOriginAndDestination();
        if (typeof inputValue !== "object") {
          // Trigger only when inputValue is a string of exactly 2 characters
          if (typeof inputValue === 'string' && inputValue.length === 2) {
            let input = {
              inputValue: inputValue,
              control: this.control
            }
            this.emitInputValue.emit(input);
            this.displayValue = inputValue;
          }
        }

        if (typeof inputValue == "object") {
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

  onInput(event: any) {
    if (this.controlConfig.autoFormat) {
      let inputValue = (event.target.value).toString();
      this.controlConfig.autoFormat.patterns?.forEach((pattern: any) => {
        inputValue = inputValue.replace(new RegExp(pattern), '');
      })
      if (inputValue.length > this.controlConfig.autoFormat.range.max) {
        inputValue = inputValue.substring(0, this.controlConfig.autoFormat.range.max);
      }
      this.control.setValue(inputValue, { emitEvent: false });
    }
  }

  onCityAutoCompleteBlur() {
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
          this.control.setValue(null, { emitEvent: false });
          this.snackbarService.error(`Please select a valid city from the list for ${this.controlConfig.label}.`);
          return;
        }
      }, 500);
    }
  }

  onBlur() {
    let value = this.control.value;

    // Handle empty or null input: set to 0 with precision
    if (value === null || value === undefined || value === '') {
      this.control.setValue(this.getFormattedValue(0), { emitEvent: false });
      return;
    }

    if (this.controlConfig.autoFormat) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const formatted = this.getFormattedValue(numericValue);
        this.control.setValue(formatted, { emitEvent: false });
      }
    }

    // Handle dependent cases if any
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

  handleDependentCase(dependentCase: any) {
    if (!dependentCase.apiService || !dependentCase.apiMethod) return;

    let apiSubscription: Subscription;
    const apiService = this.serviceRegistry.getService(dependentCase.apiService);

    if (apiService && typeof apiService[dependentCase.apiMethod] === "function") {
      // Dynamically populate request body from input controls
      let requestBody: any = dependentCase.requestBody;
      let shouldMakeApiCall = true;
      Object.entries(dependentCase.inputControls).forEach(([controlName, requestKey]) => {
        if (typeof requestKey === 'string') { // Ensure requestKey is a string
          const controlValue = this.form.get(controlName)?.value;
          if (!controlValue) {
            this.snackbarService.error(`Please Select a ${controlName}.`);
            shouldMakeApiCall = false;
          } else {
            requestBody[requestKey] = controlValue[dependentCase.key] ?? controlValue; // Extract Id if it's an object
          }
        }
      });
      if (shouldMakeApiCall) {
        apiSubscription = apiService[dependentCase.apiMethod](requestBody).subscribe(
          (response: any) => {
            // Dynamically set output controls based on response mapping
            if (typeof dependentCase.outputControl === 'string') {
              // Single field case
              const value = this.extractValueFromPath(response, dependentCase.outputControl);
              if (value !== undefined) {
                this.form.get(dependentCase.outputControl)?.setValue(value);
              }
            } else if (typeof dependentCase.outputControl === 'object') {
              // Multiple fields case
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
          },
          (error: any) => {
            console.error("API Error:", error);
          }
        );
      }

    } else {
      console.warn(`Invalid API service or method: ${dependentCase.apiService}.${dependentCase.apiMethod}`);
    }
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
      if (this.control.hasError(validation.type)) {
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