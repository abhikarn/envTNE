import { CommonModule } from '@angular/common';
import { Component, Inject, Optional, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-remarks-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    DecimalFormatPipe
  ],
  templateUrl: './remarks-modal.component.html',
  styleUrl: './remarks-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RemarksModalComponent {

  public remarksData: any[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<RemarksModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { remarksData: any[] } | null,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public bottomSheetData: { remarksData: any[] } | null,
    @Optional() private bottomSheetRef?: MatBottomSheetRef<RemarksModalComponent>
  ) {}

  ngOnInit() {
   
    if (this.data && this.data.remarksData) {
      this.remarksData = this.data.remarksData;
    } else if (this.bottomSheetData && this.bottomSheetData.remarksData) {
      this.remarksData = this.bottomSheetData.remarksData;
    } else if ((this.bottomSheetRef as any)?.containerInstance?.bottomSheetConfig?.data?.remarksData) {
      this.remarksData = (this.bottomSheetRef as any).containerInstance.bottomSheetConfig.data.remarksData;
    }
    // Defensive: always ensure remarksData is an array
    if (!Array.isArray(this.remarksData)) {
      this.remarksData = [];
    }
    console.log(this.remarksData);
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.bottomSheetRef) {
      this.bottomSheetRef.dismiss();
    }
  }
}
