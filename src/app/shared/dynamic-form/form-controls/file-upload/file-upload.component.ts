import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DocumentService } from '../../../../../../tne-api';
import { take } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '../../../service/snackbar.service';
import { environment } from '../../../../../environment';
import { HttpClient } from '@angular/common/http';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { OcrResultDialogComponent } from './ocr-result-dialog.component';

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
  @Input() form: any
  @Input() formConfig: any
  @Output() ocrCompleted = new EventEmitter<any>();

  ocrResult: any;

  constructor(
    private documentService: DocumentService,
    private domSanitizer: DomSanitizer,
    private snackbarService: SnackbarService,
    private http: HttpClient,
    private confirmDialogService: ConfirmDialogService,
    private dialog: MatDialog
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
          const lastDotIndex = file.name.lastIndexOf('.');
          const fileName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
          const fileExtension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : '';
          const payload = {
            ImageString: base64,
            FileName: fileName,
            FileExtension: fileExtension
          };
          if (file.size > maxSizeBytes) {
            this.snackbarService.error(`File "${file.name}" exceeds the ${this.controlConfig.maxSizeMB} MB limit.`);
            return;
          } else {
            // Only call OCR if OCRRequired is true in controlConfig or its parent category
            if (this.controlConfig.oCRRequired) {
              this.uploadOcrFile(file || null);
            }
            this.uploadFile(payload);
            console.log('Prepared File Payload:', payload);
          }
        };
        reader.readAsDataURL(file);
      });
      this.control.setValue(this.selectedFiles);
    }
    input.value = '';
  }

  uploadFile(payload: any) {
    if (payload) {
      this.documentService.documentDocumentWebUpload(payload).pipe(take(1)).subscribe({
        next: (res: any) => {
          if (
            res &&
            res.ResponseValue
          ) {
            let filterResponse: any = {};
            filterResponse.ReferenceType = this.controlConfig.referenceType;
            filterResponse.ReferenceId = res.ResponseValue.ReferenceId;
            filterResponse.DocumentId = res.ResponseValue.DocumentId;
            filterResponse.FileName = res.ResponseValue.FileName;
            filterResponse.Location = res.ResponseValue.Location;
            filterResponse.Guid = res.ResponseValue.Guid;

            this.selectedFiles.push(filterResponse);
            this.control.setValue(this.selectedFiles);
          } else {
            this.snackbarService.error('File upload failed or response is invalid.');
          }
        },
        error: (err: any) => {
          this.snackbarService.error('File upload failed.');
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
    const fileUrl = `${environment.documentBaseUrl}/${baseName}-${file.Guid}.${extension}`;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  downloadFile(file: any) {

    const extension = file.FileName.split('.').pop()?.toLowerCase();
    const baseName = file.FileName.replace(/\.[^/.]+$/, '');
    const fileUrl = `${environment.documentBaseUrl}/${baseName}-${file.Guid}.${extension}`;
    // if (extension === 'pdf') {
    window.open(fileUrl, '_blank');
    // } else {
    //   const link = document.createElement('a');
    //   link.href = fileUrl;
    //   link.download = file.FileName || 'downloaded-file';
    //   link.click();
    // }
  }

  /**
   * Uploads a file to the OCR API and stores the result in ocrResult.
   * @param file The file to upload for OCR processing.
   */
  uploadOcrFile(file: File) {

    if (!file) {
      this.snackbarService.error('No file selected for OCR processing.');
      return;
    }
    const formData = new FormData();
    formData.append('File', file);

    // Use environment variable for OCR API base URL
    const ocrApiBaseUrl = environment.ocrApiBaseUrl || 'https://localhost:7173/';
    this.http.post(`${ocrApiBaseUrl}api/Ocr/upload`, formData)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          
          this.ocrResult = res;
          if (this.ocrResult.StatusCode == 400) {
            this.snackbarService.error('OCR processing failed: ' + this.ocrResult.ErrorMessage);
            return;
          }

          // Set Currency to 1 if it is "INR"
          if (this.ocrResult?.Data?.Currency === "INR") {
            this.ocrResult.Data.Currency = 1;
          }else if (this.ocrResult?.Data?.Currency === "USD") {
            this.ocrResult.Data.Currency = 2;
          } else if (this.ocrResult?.Data?.Currency === "EUR") {
            this.ocrResult.Data.Currency = 3;
          } else if (this.ocrResult?.Data?.Currency === "GBP") {
            this.ocrResult.Data.Currency = 4;
          } else if (this.ocrResult?.Data?.Currency === "JPY") {
            this.ocrResult.Data.Currency = 5;
          } else if (this.ocrResult?.Data?.Currency === "AUD") {
            this.ocrResult.Data.Currency = 6;
          } else if (this.ocrResult?.Data?.Currency === "CAD") {
            this.ocrResult.Data.Currency = 7;
          } else if (this.ocrResult?.Data?.Currency === "SGD") {
            this.ocrResult.Data.Currency = 8;
          } else if (this.ocrResult?.Data?.Currency === "CNY") {
            this.ocrResult.Data.Currency = 9;
          } else if (this.ocrResult?.Data?.Currency === "RUB") {
            this.ocrResult.Data.Currency = 10;
          } else if (this.ocrResult?.Data?.Currency === "ZAR") {
            this.ocrResult.Data.Currency = 11;
          } else if (this.ocrResult?.Data?.Currency === "CHF") {
            this.ocrResult.Data.Currency = 12;
          } else if (this.ocrResult?.Data?.Currency === "NZD") {
            this.ocrResult.Data.Currency = 13;  
          }else if (this.ocrResult?.Data?.Currency === "AED") {
            this.ocrResult.Data.Currency = 14;
          }else if (this.ocrResult?.Data?.Currency === "SAR") {
            this.ocrResult.Data.Currency = 15;
          } else {
             this.ocrResult.Data.Currency = 1;
          }

          localStorage.setItem('ocrResult', JSON.stringify(this.ocrResult.Data));
          // Show OCR result in a Material dialog
          const dialogRef = this.dialog.open(OcrResultDialogComponent, {
            width: '1000px',
            data: this.ocrResult.Data
          });
          dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
              
              this.form.patchValue(this.ocrResult.Data);
              this.formConfig.forEach((control: any) => {
                // Check if the control is in the OCR result
                if (this.ocrResult.Data && this.ocrResult.Data.hasOwnProperty(control.name)) {
                  // set number controls to number type with global decimal precision
                  if (control.dataType === 'numeric' && this.ocrResult.Data[control.name] !== null) {
                    const precision = control.autoFormat?.decimalPrecision || 2; // Default to 2 decimal places if not specified
                    this.form.get(control.name)?.setValue(parseFloat(this.ocrResult.Data[control.name]).toFixed(precision));
                  }
                }
              });

              // Set readonly on all controls that were patched by OCR
              if (this.ocrResult.Data && typeof this.ocrResult.Data === 'object') {
                
                Object.keys(this.ocrResult.Data).forEach(key => {
                  // Find the control config and set readonly
                  if (this.form.controls[key]) {
                    const controlConfig = this.formConfig?.find?.((c: any) => c.name === key);
                    if (controlConfig) {
                      controlConfig.readonly = true;
                    }
                  }
                });
              }
              this.ocrCompleted.emit(this.ocrResult.Data);
              this.snackbarService.success('OCR processing completed.');
            } else {
              this.snackbarService.info('OCR result not applied.');
            }
          });
          if (!this.ocrResult) {
            this.snackbarService.error('OCR processing returned no result.');
            return;
          }
          console.log('OCR Result:', this.ocrResult);
        },
        error: (err: any) => {
          this.ocrResult = null;
          this.snackbarService.error('OCR upload failed.');
          console.error(err);
        }
      });
  }

  getErrorMessage(): string {
    if (!this.control || !this.control.errors) return '';

    const errors = this.control.errors;

    if (errors['required']) {
      return this.controlConfig?.validations?.find((v: any) => v.type === 'required')?.message || `${this.controlConfig.label} is required`;
    }

    if (errors['maxSize']) {
      return `File size should not exceed ${this.controlConfig.maxSizeMB} MB`;
    }

    // Add other error checks if needed
    return 'Invalid input';
  }
}
