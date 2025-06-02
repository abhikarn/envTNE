import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-date-extension',
  standalone: true,
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
  data: any;

  constructor(
    @Optional() private dialogRef: MatDialogRef<DateExtensionComponent>,
    @Optional() private bottomSheetRef: MatBottomSheetRef<DateExtensionComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) private bottomSheetData: any,
    private fb: FormBuilder
  ) {
    // Use whichever data is available
    this.data = this.dialogData || this.bottomSheetData;

    this.travelForm = this.fb.group({
      travelFromDate: [this.extractDate(this.data?.TravelDateFrom), Validators.required],
      travelFromTime: [this.extractTime(this.data?.TravelDateFrom), Validators.required],
      travelToDate: [this.extractDate(this.data?.TravelDateTo), Validators.required],
      travelToTime: [this.extractTime(this.data?.TravelDateTo), Validators.required],
      remarks: [this.data?.remarks || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.travelForm.valid) {
      const formValue = this.travelForm.value;
      const TravelDateFrom = this.mergeDateTime(formValue.travelFromDate, formValue.travelFromTime);
      const TravelDateTo = this.mergeDateTime(formValue.travelToDate, formValue.travelToTime);

      const result = {
        TravelDateFrom,
        TravelDateTo,
        Remarks: formValue.remarks
      };

      this.close(result);
    }
  }

  onClose() {
    this.close();
  }

  private close(result?: any) {
    if (this.dialogRef) {
      this.dialogRef.close(result);
    } else if (this.bottomSheetRef) {
      this.bottomSheetRef.dismiss(result);
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
}
