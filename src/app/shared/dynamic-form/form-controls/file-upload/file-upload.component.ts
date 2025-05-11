
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DocumentService } from '../../../../../../tne-api';
import { take } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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
    private domSanitizer: DomSanitizer
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    // console.log(input.files)
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
          this.uploadFile(payload);
          console.log('Prepared File Payload:', payload); 
        };
        reader.readAsDataURL(file);
      });
      this.control.setValue(this.selectedFiles);
    }
  }

  uploadFile(payload: any) {
    if(payload) {
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
    const url = file?.fileUrl || file?.Location; // adjust based on your backend response
    if (url) {
      window.open(url, '_blank');
    }
  }

  downloadFile(file: any) {
    const url = this.domSanitizer.bypassSecurityTrustResourceUrl(file?.fileUrl || file?.Location);
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = file?.FileName || 'downloaded-file';
    link.click();
  }

  getErrorMessage() {
    if (this.control.hasError('required')) {
      return this.controlConfig.validations.find((v: any) => v.type === 'required')?.message;
    }
    return '';
  }
}
