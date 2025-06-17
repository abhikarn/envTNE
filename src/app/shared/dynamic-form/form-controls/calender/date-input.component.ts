import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
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
import _moment from 'moment';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { CommonModule } from '@angular/common';

// Custom date formats for display
export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MMM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
    timeInput: 'HH:mm',
    timeOptionLabel: 'HH:mm',
  },
};

@Component({
  selector: 'lib-date-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FunctionWrapperPipe,
    MatTimepickerModule
  ],
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  timeControl: FormControl = new FormControl(null);
  pendingTime: string | null = null;

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

    this.control.valueChanges.subscribe(value => this.handleDateChange(value));
    this.timeControl.valueChanges.subscribe(time => this.handleTimeChange(time));

    // Pre-fill time control from existing datetime
    if (this.controlConfig.time) {
      const initial = this.control.value ? _moment(this.control.value) : _moment();
      this.pendingTime = initial.format('HH:mm');
      this.timeControl.setValue(this.pendingTime, { emitEvent: false });
    }
  }

  handleDateChange(value: any): void {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return;

    let dateMoment: _moment.Moment | null = null;

    if (value instanceof Date) {
      dateMoment = _moment(value);
    } else if (_moment.isMoment(value)) {
      dateMoment = value;
    }

    if (dateMoment) {
      const time = this.pendingTime ?? '00:00';
      this.setControlValueWithTime(dateMoment, time);
    }
  }

  handleTimeChange(timeValue: any): void {
    if (!timeValue) return;

    this.pendingTime = typeof timeValue === 'string' && timeValue.includes(':')
      ? timeValue
      : _moment(timeValue, 'HH:mm').format('HH:mm');

    if (this.control.value) {
      const dateMoment = _moment(this.control.value);
      this.setControlValueWithTime(dateMoment, this.pendingTime);
    }
  }

  setControlValueWithTime(date: _moment.Moment, timeStr: string): void {
    const [hours, minutes] = timeStr.split(':').map(Number);

    date.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0
    });

    const localIso = date.format('YYYY-MM-DDTHH:mm:ss');
    this.control.setValue(localIso, { emitEvent: false });
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
    // Ensure newDate is a native Date object
    let newDate: Date | null = null;
    if (event.value) {
      if (_moment.isMoment(event.value)) {
        newDate = event.value.toDate();
      } else {
        newDate = event.value;
      }
    }
    if (newDate && this.controlConfig.time && this.control.value) {
      const old = _moment(this.control.value);
      newDate.setHours(old.hour(), old.minute(), old.second(), old.millisecond());
    }
    if (newDate) {
      this.control.setValue(_moment.utc(newDate).toISOString());
    }
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
