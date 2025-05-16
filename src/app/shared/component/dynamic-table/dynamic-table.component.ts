import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent implements OnInit {
  @Input() tableData: any[] = [];
  @Input() categoryConfig: any;
  @Output() editRow = new EventEmitter<any>();

  tableColumns: { name: string; label: string }[] = [];
  nestedTables: any[] = [];
  expandedRowIndex: number | null = null;
  tableOutFields: { name: string; label: string }[] = [];


  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.categoryConfig?.columns?.length > 0) {
      this.tableColumns = this.categoryConfig.columns
        .filter((col: any) => col.visible && col.position === 'in')
        .map((col: any) => ({ name: col.name, label: col.label }));

      this.tableOutFields = this.categoryConfig.columns
        .filter((col: any) => col.visible && col.position === 'out')
        .map((col: any) => ({ name: col.name, label: col.label }));
    }

    if (this.categoryConfig?.nestedTables?.length > 0) {
      this.nestedTables = this.categoryConfig.nestedTables;
    }
  }


  get displayedColumns(): string[] {
    return this.tableColumns.map(col => col.name);
  }

  isDate(value: any): boolean {
    return value instanceof Date || (!isNaN(Date.parse(value)) && typeof value === 'string');
  }

  isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  formatValue(columnName: string, value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object' && 'label' in value) return value.label;
    if (this.isDate(value)) {
      return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return value;
  }

  edit(row: any, index: any) {
    let rowData = {
      row: row,
      index: index
    };
    this.editRow.emit(rowData);
  }

  toggleRow(index: number) {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }

  previewFile(file: any) {
    const extension = file.FileName?.split('.').pop()?.toLowerCase();
    const baseName = file.FileName?.replace(/\.[^/.]+$/, '');
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
}
