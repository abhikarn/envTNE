import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-requester-details-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './requester-details-dialog.component.html',
  styleUrl: './requester-details-dialog.component.scss'
})

export class RequesterDetailsDialogComponent {

  constructor(
    @Optional() public dialogRef: MatDialogRef<RequesterDetailsDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public bottomSheetData: any,
    @Optional() private bottomSheetRef?: MatBottomSheetRef<RequesterDetailsDialogComponent>
  ) {
    this.data = data || bottomSheetData || {};
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.bottomSheetRef) {
      this.bottomSheetRef.dismiss();
    }
  }
}
