import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dynamic-table',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent implements OnInit {
  @Input() tableData: any[] = [];
  @Output() editRow = new EventEmitter<any>();

  expandedRowIndex: number | null = null;

  constructor(
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // console.log('Dynamic Table Data', this.tableData);
  }

  // Exclude Remarks & Attachment from columns
  get displayedColumns(): string[] {
    if (this.tableData.length > 0) {
      return Object.keys(this.tableData[0]).filter(
        col => col !== 'Remarks' && col !== 'attachment' && col !== 'gst' && col !== 'ReferenceId' && col !== 'IsViolation'
      );
    }
    return [];
  }

  isDate(value: any): boolean {
    return value instanceof Date || (!isNaN(Date.parse(value)) && typeof value === 'string');
  }

  isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  edit(row: any, index: any) {
    let rowData = {
      row: row,
      index: index
    }
    this.editRow.emit(rowData); // Send row data to Dynamic Form Component
  }

  toggleRow(index: number) {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
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
    link.download = file?.fileName || 'downloaded-file';
    link.click();
  }

}
