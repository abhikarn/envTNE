import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../component/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogRef?: MatDialogRef<ConfirmDialogComponent>;

  constructor(private dialog: MatDialog) { }

  confirm(data: ConfirmDialogData): Observable<boolean> {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data
    });

    return this.dialogRef.afterClosed();
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = undefined;
    }
  }
}
