import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DocumentService } from '../../../../../../tne-api';
import { Observable, take } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '../../../service/snackbar.service';
import { environment } from '../../../../../environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { OcrResultDialogComponent } from './ocr-result-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { NewExpenseService } from '../../../../feature/expense/service/new-expense.service';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { GlobalConfigService } from '../../../service/global-config.service';
import { IFormControl } from '../../form-control.interface';

@Component({
  selector: 'lib-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FunctionWrapperPipe
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FileUploadComponent extends BaseFormControlComponent {
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override control: FormControl = new FormControl([]);
  @Input() override form: FormGroup = new FormGroup({});
  @Input() selectedFiles: any = [];
  @Input() formConfig: any;
  @Output() ocrCompleted = new EventEmitter<any>();

  ocrResult: any;
  showMobileUpload = false;
  @ViewChild('uploadMobileSheet') uploadMobileSheet!: TemplateRef<any>;

  private currencyMap: Map<string, number> = new Map();

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService,
    private documentService: DocumentService,
    private domSanitizer: DomSanitizer,
    private http: HttpClient,
    private confirmDialogService: ConfirmDialogService,
    private dialog: MatDialog,
    private bottomSheet?: MatBottomSheet,
    private newexpenseService?: NewExpenseService
  ) {
    super(serviceRegistry, snackbarService, configService);
    this.loadCurrencyMap();
  }

  private loadCurrencyMap() {
    this.http.get('assets/currency.json').subscribe((data: any) => {
      data.currencies.forEach((currency: any) => {
        this.currencyMap.set(currency.code, currency.id);
      });
    });
  }

  override ngOnInit() {
    super.ngOnInit();
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
            if (this.controlConfig.oCRRequired) {
              // Only call OCR, do not upload file yet
              this.uploadOcrFile(file || null, payload);
            } else {
              // As-is: upload file immediately
              this.uploadFile(payload);
              console.log('Prepared File Payload:', payload);
            }
          }
        };
        reader.readAsDataURL(file);
      });
      this.control.setValue(this.selectedFiles);
    }
    input.value = '';
    this.closeMobileUploadModal();
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
    const fileNameWithGuid = `${baseName}-${file.Guid}.${extension}`;
    const originalFileName = `${baseName}.${extension}`;

    const data = {
      "originalFileName": originalFileName,
      "fileName": fileNameWithGuid
    };

    // Subscribe to the observable to actually make the HTTP request and handle the download
    this.newexpenseService?.documentDownload(data).pipe(take(1)).subscribe({
      next: (blob: Blob) => {
        
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
        this.snackbarService.error('Error downloading file');
      }
    });
  }

  uploadOcrFile(file: File, payload?: any) {
    if (!file) {
      this.snackbarService.error('No file selected for OCR processing.');
      return;
    }
    const formData = new FormData();
    formData.append('File', file);

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

          // Replace currency code with ID using the map
          if (this.ocrResult?.Data?.Currency) {
            this.ocrResult.Data.Currency = this.currencyMap.get(this.ocrResult.Data.Currency) || 1;
          }

          localStorage.setItem('ocrResult', JSON.stringify(this.ocrResult.Data));
          const dialogRef = this.dialog.open(OcrResultDialogComponent, {
            width: '1000px',
            data: this.ocrResult.Data
          });
          dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.form.patchValue(this.ocrResult.Data);
              this.formConfig.forEach((control: any) => {
                if (this.ocrResult.Data && this.ocrResult.Data.hasOwnProperty(control.name)) {
                  if (control.dataType === 'numeric' && this.ocrResult.Data[control.name] !== null) {
                    const precision = control.autoFormat?.decimalPrecision || 2;
                    this.form.get(control.name)?.setValue(parseFloat(this.ocrResult.Data[control.name]).toFixed(precision));
                  }
                }
              });

              if (this.ocrResult.Data && typeof this.ocrResult.Data === 'object') {
                Object.keys(this.ocrResult.Data).forEach(key => {
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

              // Only upload file after OCR is applied and user confirms
              if (payload) {
                this.uploadFile(payload);
                console.log('Prepared File Payload:', payload);
              }
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
        error: (error) => {
          this.ocrResult = null;
          this.snackbarService.error('OCR processing failed.');
          console.error('OCR Error:', error);
        }
      });
  }

  override getErrorMessage(): string {
    return super.getErrorMessage();
  }

  openMobileUploadSheet() {
    if (this.bottomSheet && this.uploadMobileSheet) {
      this.bottomSheet.open(this.uploadMobileSheet);
    }
  }

  closeMobileUploadModal() {
    if (this.bottomSheet) {
      this.bottomSheet.dismiss();
    }
  }

  onMobileUploadClick(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.onFileSelected(event);
    }
  }

  triggerInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private openFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }
}
