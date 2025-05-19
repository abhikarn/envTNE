
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DocumentService } from '../../../../../../tne-api';
import { take } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '../../../service/snackbar.service';

@Component({
  selector: 'lib-file-upload',
  imports: [
    FunctionWrapperPipe
  ],
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  @Input() controlConfig: any;
  @Input() control!: FormControl;
  @Input() selectedFiles: any = [];

  constructor(
    private documentService: DocumentService,
    private domSanitizer: DomSanitizer,
    private snackbarService: SnackbarService
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const maxSizeBytes = (this.controlConfig.maxSizeMB ?? 20) * 1024 * 1024;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      newFiles.forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          const payload = {
            ImageString: base64,
            FileName: file.name.split('.').shift(),
            FileExtension: '.' + file.name.split('.').pop()
          };
          if (file.size > maxSizeBytes) {
            this.snackbarService.error(`File "${file.name}" exceeds the ${this.controlConfig.maxSizeMB} MB limit.`);
            return;
          } else {
            this.uploadFile(payload);
            console.log('Prepared File Payload:', payload);
          }
        };
        reader.readAsDataURL(file);
      });
      this.control.setValue(this.selectedFiles);
    }
  }

  uploadFile(payload: any) {
    if (payload) {
      this.documentService.documentDocumentWebUpload(payload).pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log('Files uploaded successfully', res);
          let filterResponse: any = {};
          filterResponse.ReferenceType = this.controlConfig.referenceType;
          filterResponse.ReferenceId = res.ResponseValue.ReferenceId;
          filterResponse.DocumentId = res.ResponseValue.DocumentId;
          filterResponse.FileName = res.ResponseValue.FileName;
          filterResponse.Location = res.ResponseValue.Location;
          filterResponse.Guid = res.ResponseValue.Guid;

          this.selectedFiles.push(filterResponse);
          this.control.setValue(this.selectedFiles);
        },
        error: (err: any) => {
          console.log(err)
        }
      })
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  previewFile(file: any) {
    const extension = file.FileName.split('.').pop()?.toLowerCase();
    const baseName = file.FileName.replace(/\.[^/.]+$/, '');
    const fileUrl = `https://localhost:44364/Document/${baseName}-${file.Guid}.${extension}`;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  downloadFile(file: any) {
    const url = this.domSanitizer.bypassSecurityTrustResourceUrl(file?.fileUrl || file?.Location);
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = file?.FileName || 'downloaded-file';
    link.click();
  }

  getErrorMessage(): string {
    if (!this.control || !this.control.errors) return '';

    const errors = this.control.errors;

    if (errors['required']) {
      return this.controlConfig?.validations?.find((v: any) => v.type === 'required')?.message || 'This field is required';
    }

    if (errors['maxSize']) {
      return `File size should not exceed ${this.controlConfig.maxSizeMB} MB`;
    }

    // Add other error checks if needed
    return 'Invalid input';
  }

}
