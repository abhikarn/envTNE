import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ocr-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './ocr-result-dialog.component.html',
  styleUrl: './ocr-result-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OcrResultDialogComponent implements OnInit {
  dataKeys: string[];
  ammoutData: any;
  gstKeys: string[] = [];
  currencyMap: Map<number, string> = new Map();

  constructor(
    public dialogRef: MatDialogRef<OcrResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private confirmDialogService: ConfirmDialogService,
    private http: HttpClient
  ) {
    this.dataKeys = Object.keys(data || {}).filter(k => k !== 'gst' && k !== 'AmountValidation' && k !== 'HasRestrictedLineItems');
    this.ammoutData = data?.AmountValidation; // <-- Fix: assign the actual object

    if (data?.gst) {
      this.gstKeys = Object.keys(data.gst);
      //   this.dataKeys.push('gst');
    }
  }

  ngOnInit() {
    this.loadCurrencyMap();
  }

  private loadCurrencyMap() {
    this.http.get('assets/currency.json').subscribe((data: any) => {
      this.currencyMap = new Map(
        data.currencies.map((c: any) => [c.id, c.name])
      );
    });
  }

  getCurrencyName(id: number): string {
    return this.currencyMap.get(id) || '-';
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

  onClose() {
    this.onCancel();
  }
}
