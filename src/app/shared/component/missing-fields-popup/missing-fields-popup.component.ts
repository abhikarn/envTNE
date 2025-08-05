import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-missing-fields-popup',
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './missing-fields-popup.component.html',
  styleUrl: './missing-fields-popup.component.scss'
})
export class MissingFieldsPopupComponent {
  displayedColumns: string[] = ['index', 'missing'];

  constructor(
    public dialogRef: MatDialogRef<MissingFieldsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
