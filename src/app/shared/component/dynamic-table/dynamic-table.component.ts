import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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

  ngOnInit() {
    // console.log('Dynamic Table Data', this.tableData);
  }

  // Exclude Remarks & Attachment from columns
  get displayedColumns(): string[] {
    if (this.tableData.length > 0) {
      return Object.keys(this.tableData[0]).filter(
        col => col !== 'Remarks' && col !== 'attachment' && col !== 'GSTDetails' && col !== 'ReferenceId'
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

}
