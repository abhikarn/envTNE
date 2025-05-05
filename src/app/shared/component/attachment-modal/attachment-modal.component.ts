import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-attachment-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './attachment-modal.component.html',
  styleUrl: './attachment-modal.component.scss'
})
export class AttachmentModalComponent {

  constructor(
    private domSanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<AttachmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { attachments: any[] }
  ) { }

  downloadFile(file: any) {
    const url = this.domSanitizer.bypassSecurityTrustResourceUrl(file?.fileUrl || file?.Location);
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = file?.FileName || 'downloaded-file';
    link.click();
  }
}
