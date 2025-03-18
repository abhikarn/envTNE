import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class DynamicTableComponent {
  @Input() tableData: any[] = [];
  @Output() editRow = new EventEmitter<any>();

  // Exclude Remarks & Attachment from columns
  get displayedColumns(): string[] {
    if (this.tableData.length > 0) {
      return Object.keys(this.tableData[0]).filter(
        col => col !== 'Remarks' && col !== 'attachment'
      );
    }
    return [];
  }

  isDate(value: any): boolean {
    return value instanceof Date || (!isNaN(Date.parse(value)) && typeof value === 'string');
  }

  edit(row: any) {
    console.log(row);
    this.editRow.emit(row); // Send row data to Dynamic Form Component
  }

}
