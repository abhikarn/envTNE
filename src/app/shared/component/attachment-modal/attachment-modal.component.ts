import { CommonModule } from '@angular/common';
import { Component, Inject, Optional, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environment';
import { take } from 'rxjs';
import { NewExpenseService } from '../../../feature/expense/service/new-expense.service';
import { SnackbarService } from '../../service/snackbar.service';

@Component({
  selector: 'app-attachment-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './attachment-modal.component.html',
  styleUrl: './attachment-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentModalComponent {

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  paginatedAttachments: any[] = [];
  attachments: any[];

  constructor(
    private domSanitizer: DomSanitizer,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public bottomSheetData: any,
    @Optional() private dialogRef: MatDialogRef<AttachmentModalComponent>,
    @Optional() private bottomSheetRef: MatBottomSheetRef<AttachmentModalComponent>,
    private newexpenseService?: NewExpenseService, // Replace with actual service type
    private snackbarService?: SnackbarService // Replace with actual service type
  ) {
    // Use whichever data is available
    this.attachments = (dialogData && dialogData.attachments) ||
      (bottomSheetData && bottomSheetData.attachments) ||
      [];
    this.updatePagination();
  }

  ngOnChanges() {
    this.updatePagination();
  }

  updatePagination() {
    const total = this.attachments?.length || 0;
    this.totalPages = Math.ceil(total / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAttachments = (this.attachments || []).slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  // downloadFile(file: any) {
  //   const url = this.domSanitizer.bypassSecurityTrustResourceUrl(file?.fileUrl || file?.Location);
  //   const link = document.createElement('a');
  //   link.href = url.toString();
  //   link.download = file?.FileName || 'downloaded-file';
  //   link.click();
  // }

  // previewFile(file: any) {
  //   const url = file?.fileUrl || file?.Location;
  //   if (url) {
  //     window.open(url, '_blank');
  //   }
  // }

  previewFile(file: any) {
    const extension = file.FileName.split('.').pop()?.toLowerCase();
    const baseName = file.FileName.replace(/\.[^/.]+$/, '');
    const fileUrl = `${environment.documentBaseUrl}/${baseName}-${file.Guid}.${extension}`;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  downloadFile(file: any) {
    const extension = file.FileName.split('.').pop()?.toLowerCase();
    const baseName = file.FileName.replace(/\.[^/.]+$/, '');
    const fileNameWithGuid = `${baseName}-${file.Guid}.${extension}`;
    const originalFileName = `${baseName}.${extension}`;

    const data = {
      "originalFileName": originalFileName,
      "fileName": fileNameWithGuid
    };

    // Subscribe to the observable to actually make the HTTP request and handle the download
    this.newexpenseService?.documentDownload(data).pipe(take(1)).subscribe({
      next: (blob: Blob) => {
        debugger;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.snackbarService?.error('Error downloading file');
      }
    });
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.bottomSheetRef) {
      this.bottomSheetRef.dismiss();
    }
  }
}
