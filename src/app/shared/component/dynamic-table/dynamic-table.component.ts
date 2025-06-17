import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { GlobalConfigService } from '../../service/global-config.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent implements OnInit {
  @Input() tableData: any[] = [];
  @Input() categoryConfig: any;
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<number>();

  tableColumns: { name: string; label: string }[] = [];
  nestedTables: any[] = [];
  expandedRowIndex: number | null = null;
  tableOutFields: { name: string; label: string }[] = [];


  constructor(
    private domSanitizer: DomSanitizer,
    private configService: GlobalConfigService,
    private datePipe: DatePipe,
    private confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit() {
    console.log(this.tableData)
    this.setDecimalPrecision();
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

  setDecimalPrecision() {
    if (this.categoryConfig?.columns?.length > 0) {
      this.categoryConfig.columns.forEach((column: any) => {
        if (column.type === 'number') {
          this.tableData.forEach((row: any) => {
            if (row[column.name] !== undefined) {
              row[column.name] = parseFloat(row[column.name]).toFixed(column.decimalPrecision || this.configService.getDecimalPrecision());
            }
          });
        }
      });
    }
    if (this.categoryConfig?.nestedTables?.length > 0) {
      this.categoryConfig.nestedTables.forEach((nestedTable: any) => {
        nestedTable.columns.forEach((column: any) => {
          if (column.type === 'number') {
            this.tableData.forEach((row: any) => {
              if (row[nestedTable.name]?.length > 0) {
                row[nestedTable.name].forEach((nestedRow: any) => {
                  if (nestedRow[column.name] !== undefined) {
                    nestedRow[column.name] = parseFloat(nestedRow[column.name]).toFixed(column.decimalPrecision || this.configService.getDecimalPrecision());
                  }
                });
              }
            });
          }
        });
      });
    }
  }

  get displayedColumns(): string[] {
    return this.tableColumns.map(col => col.name);
  }

  isDate(value: any): boolean {
    // Only treat as date if value is a Date object or a valid ISO date string (not starting with #)
    if (value instanceof Date) return true;
    if (typeof value === 'string' && value.trim() !== '' && !value.startsWith('#')) {
      // Check for valid ISO date string (YYYY-MM-DD or similar)
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;
      return isoDateRegex.test(value) && !isNaN(Date.parse(value));
    }
    return false;
  }

  isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  formatValue(columnName: string, value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object' && 'label' in value) return value.label;

    // Only treat as date if column type is 'date' or 'datetime'
    const column = this.categoryConfig?.columns?.find((col: any) => col.name === columnName);
    const isDateType = column && (column.type === 'date');
    if (isDateType && this.isDate(value)) {
      const format = this.configService.dateFormat || 'dd-MMM-yyyy';
      return this.formatDateUsingFormat(value, format);
    }

    const isDateTimeType = column && (column.type === 'datetime');
    if (isDateTimeType && this.isDate(value)) {
      const format = this.configService.dateTimeFormat || 'dd-MMM-yyyy HH:mm';
      return this.formatDateUsingFormat(value, format);
    }

    return value;
  }

  formatDateUsingFormat(value: string | Date, format: string): string {
    return this.datePipe.transform(value, format) || value.toString();
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

  confirmDelete(index: number): void {
    this.confirmDialogService.confirm({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row?',
      confirmText: 'Yes',
      cancelText: 'No'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteRow.emit(index);
      }
    });
  }

}
