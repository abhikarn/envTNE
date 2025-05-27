import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IFormControl } from '../../form-control.interface';
import { MatInputModule } from '@angular/material/input';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { Subscription } from 'rxjs';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';

// Custom date formats for display
export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MMM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'lib-date-input',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FunctionWrapperPipe
  ],
  templateUrl: './date-input.component.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } }
  ]
})

export class DateInputComponent {
  @Input() control: FormControl = new FormControl(null);
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() form: any;
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  @Output() emitSpecificCase = new EventEmitter<any>();

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

    this.control.valueChanges.subscribe(value => {
      if (_moment.isMoment(value)) {
        // Use local date format to avoid timezone shift
        const localDate = value.format('YYYY-MM-DD');
        if (this.control.value !== localDate) {
          this.control.setValue(localDate, { emitEvent: false }); // Prevent infinite loop
        }
      }
    });
  }

  getErrorMessage(): string {
    if (!this?.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }

  onDateSelect(event: MatDatepickerInputEvent<Date>): void {
    this.valueChange.emit({ event, control: this.controlConfig });
    if (this.controlConfig.dependentCases?.length > 0) {
      this.controlConfig.dependentCases.forEach((dependentCase: any) => {
        if (dependentCase.isGeneral) {
          if (dependentCase.event === "dateChange") {
            this.handleDependentCase(dependentCase);
          }
        } else {
          this.emitSpecificCase.emit(dependentCase);
        }
      });
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
                  const precision = dependentCase.autoFormat?.decimalPrecision
                    ?? this.configService.getDecimalPrecision();

                  const numericValue = parseFloat(value);
                  const formatted = isNaN(numericValue) ? value : numericValue.toFixed(precision);

                  this.form.get(outputControl)?.setValue(formatted, { emitEvent: false });
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

}
