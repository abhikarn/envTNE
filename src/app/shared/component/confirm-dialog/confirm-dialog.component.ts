import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButton?: boolean;
  cancelButton?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  ngOnInit(): void {
    // Set default values if not provided
    this.data.confirmText = this.data.confirmText || 'Confirm';
    this.data.cancelText = this.data.cancelText || 'Cancel';
    // if it is undefined, set to true
    this.data.title = this.data.title || 'Confirm Action';
    this.data.message = this.data.message || 'Are you sure you want to proceed?';
    // if it is undefined, set to true
    this.data.confirmButton = this.data.confirmButton !== false; // Default to true unless explicitly set to false
    this.data.cancelButton = this.data.cancelButton !== false; // Default to true unless explicitly set to false
  }

  onConfirm(event?: Event): void {
    if (event) event.stopPropagation();
    this.dialogRef.close(true);
  }

  onCancel(event?: Event): void {
    if (event) event.stopPropagation();
    this.dialogRef.close(false);
  }
  
}
