import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requester-details-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './requester-details-dialog.component.html',
  styleUrl: './requester-details-dialog.component.scss'
})

export class RequesterDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
