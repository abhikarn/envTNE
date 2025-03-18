
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
  imports: [],
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  @Input() controlConfig: any;
  @Input() control!: FormControl;
  selectedFiles: File[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...Array.from(input.files)];
      this.control.setValue(this.selectedFiles);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  getErrorMessage() {
    if (this.control.hasError('required')) {
      return this.controlConfig.validations.find((v: any) => v.type === 'required')?.message;
    }
    return '';
  }
}
