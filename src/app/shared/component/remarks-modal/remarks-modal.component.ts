import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-remarks-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './remarks-modal.component.html',
  styleUrl: './remarks-modal.component.scss'
})
export class RemarksModalComponent {

  constructor(
    public dialogRef: MatDialogRef<RemarksModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { remarksData: any[] }
  ) { }

  ngOnInit() {
    console.log(this.data.remarksData)
  }
}
