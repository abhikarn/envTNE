import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-extension',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule
  ],
  templateUrl: './date-extension.component.html',
  styleUrl: './date-extension.component.scss'
})
export class DateExtensionComponent {
  travelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DateExtensionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.travelForm = this.fb.group({
      travelFromDate: [this.extractDate(data?.TravelDateFrom), Validators.required],
      travelFromTime: [this.extractTime(data?.TravelDateFrom), Validators.required],
      travelToDate: [this.extractDate(data?.TravelDateTo), Validators.required],
      travelToTime: [this.extractTime(data?.TravelDateTo), Validators.required],
      remarks: [data?.remarks || '', Validators.required]
    });
  }

  ngOnInit() {

  }

  onSubmit() {
    if (this.travelForm.valid) {
      const formValue = this.travelForm.value;

      const TravelDateFrom = this.mergeDateTime(formValue.travelFromDate, formValue.travelFromTime);
      const TravelDateTo = this.mergeDateTime(formValue.travelToDate, formValue.travelToTime);

      this.dialogRef.close({
        TravelDateFrom,
        TravelDateTo,
        Remarks: formValue.remarks
      });
    }
  }

  private extractDate(dateTimeString: string | null): Date | null {
    return dateTimeString ? new Date(dateTimeString) : null;
  }

  private extractTime(dateTimeString: string | null): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return `${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private mergeDateTime(date: Date, time: string): string {
    if (!date || !time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const mergedDate = new Date(date);
    mergedDate.setHours(hours, minutes, 0, 0);

    const tzOffset = -mergedDate.getTimezoneOffset();
    const offsetHours = Math.floor(tzOffset / 60);
    const offsetMinutes = tzOffset % 60;
    const tzSign = offsetHours >= 0 ? '+' : '-';

    return `${mergedDate.getFullYear()}-${this.padZero(mergedDate.getMonth() + 1)}-${this.padZero(mergedDate.getDate())}T${this.padZero(mergedDate.getHours())}:${this.padZero(mergedDate.getMinutes())}:00${tzSign}${this.padZero(Math.abs(offsetHours))}:${this.padZero(Math.abs(offsetMinutes))}`;
}

  onClose() {
    this.dialogRef.close();
  }

}
