import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
  selector: 'app-ocr-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './ocr-result-dialog.component.html',
  styleUrl: './ocr-result-dialog.component.scss'
})
export class OcrResultDialogComponent {
  dataKeys: string[];
  gstKeys: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<OcrResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.dataKeys = Object.keys(data || {}).filter(k => k !== 'gst' && k !== 'AmountValidation');

    if (data?.gst) {
      this.gstKeys = Object.keys(data.gst);
    //   this.dataKeys.push('gst');
    }
  }

  onConfirm() {
    if (this.data.HasRestrictedLineItems === true) {
      this.confirmDialogService.confirm({
        title: 'Restricted Line Items',
        message: 'Bill contains some restricted line items. Do you want to continue?'
      }).subscribe((userConfirmed: boolean) => {
        if (userConfirmed) {
          this.dialogRef.close(true);
        }
        // else do nothing, stay on dialog
      });
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
