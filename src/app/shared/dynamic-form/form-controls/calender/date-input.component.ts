import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
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
import { BaseFormControlComponent } from '../base-form-control.component';

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
  standalone: true,
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
export class DateInputComponent extends BaseFormControlComponent {
  @Input() override control: FormControl = new FormControl(null);
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();
  @Output() emitSpecificCase = new EventEmitter<any>();
  timeControl: FormControl = new FormControl(null);
  pendingTime: string | null = null;

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService
  ) {
    super(serviceRegistry, snackbarService, configService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.control.valueChanges.subscribe(value => {
      // If value is already an ISO string, do nothing
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return;
      }
      // If value is a Date object, treat as local and convert to UTC midnight
      if (value instanceof Date) {
        const isoDate = _moment.utc({
          year: value.getFullYear(),
          month: value.getMonth(),
          day: value.getDate()
        }).toISOString();
        if (this.control.value !== isoDate) {
          this.control.setValue(isoDate, { emitEvent: false });
        }
        return;
      }
      // If value is a moment object, treat as local and convert to UTC midnight
      if (_moment.isMoment(value)) {
        const isoDate = _moment.utc({
          year: value.year(),
          month: value.month(),
          day: value.date()
        }).toISOString();
        if (this.control.value !== isoDate) {
          this.control.setValue(isoDate, { emitEvent: false });
        }
        return;
      }
    });

    this.control.valueChanges.subscribe(value => this.handleDateChange(value));
    this.timeControl.valueChanges.subscribe(time => this.handleTimeChange(time));

    // Pre-fill time control from existing datetime
    if (this.controlConfig.time) {
      const initial = this.control.value ? _moment(this.control.value) : _moment();
      this.pendingTime = initial.format('HH:mm');
      this.timeControl.setValue(this.pendingTime, { emitEvent: false });
    }
  }

  setDateLimits(): void {
    console.log(this.controlConfig);
    const config = this.controlConfig;

    // Handle maxDate
    if (config.maxDate === 'today') {
      this.maxDate = new Date();
    } else if (config.maxDate) {
      this.maxDate = new Date(config.maxDate);
    }

    // Handle minDate
    if (config.minDate === 'today') {
      this.minDate = new Date();
    } else if (config.minDate) {
      this.minDate = new Date(config.minDate);
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

  override getErrorMessage(): string {
    return super.getErrorMessage();
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

  override handleDependentCase(dependentCase: any): void {
    super.handleDependentCase(dependentCase);
  }

  override handleDependentResponse(response: any, dependentCase: any): void {
    super.handleDependentResponse(response, dependentCase);
  }

  override extractValueFromPath(obj: any, path: string): any {
    return super.extractValueFromPath(obj, path);
  }
}
