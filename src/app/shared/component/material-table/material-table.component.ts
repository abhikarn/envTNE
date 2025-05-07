import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AddGstComponent } from '../../dynamic-form/form-controls/gst/add-gst/add-gst.component';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    AddGstComponent
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.scss'
})
export class MaterialTableComponent implements OnChanges {
  @Input() categoryName: string = '';
  @Input() data: any[] = [];
  @Input() columnConfig: any[] = [];
  @Input() slNoLabel: string = 'Sl. No.';
  @Input() nestedTables: any[] = [];
  @Input() otherFields: any[] = [];
  @Input() mode: 'preview' | 'approval' | 'finance-approval' = 'preview';
  @Input() categoryGST: any;
  @Output() selectionChanged = new EventEmitter<any>();
  selectAll: boolean = false;

  expandedRow: any | null = null;
  processedData: any[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges) {
    // Update processedData when input changes
    if (this.data?.length > 0) {
      this.processedData = this.data.map((row, index) => ({
        ...row,
        slNo: index + 1,
        selected: true,
        originalApproved: row.ApprovedAmount || 0,
        ApprovedAmount: row.ApprovedAmount || 0,
        remarks: row.remarks || ''
      }));

    } else {
      this.processedData = [];
    }
  }

  ngOnInit() {
    console.log(this.categoryGST)
    this.selectAll = this.processedData.every(r => r.selected);
  }

  get visibleColumns() {
    return (this.columnConfig || []).filter((c: any) => c.visible && !!c.name);
  }

  get columnKeys() {
    return this.visibleColumns?.map((c: any) => c.name);
  }

  get displayedColumns(): string[] {
    const base = (this.mode === 'approval' || this.mode === 'finance-approval') ? ['select'] : ['slNo'];
    return [...base, ...this.columnKeys, 'actions', 'expand'];
  }

  toggleRow(row: any) {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  isExpanded(row: any) {
    return this.expandedRow === row;
  }

  getNestedColumnKeys(columns: any[]): string[] {
    return columns?.map(c => c.name) ?? [];
  }

  showAttachments(attachments: any[]) {
    if (!attachments || attachments.length === 0) return;

    this.dialog.open(AttachmentModalComponent, {
      width: '500px',
      data: { attachments },
      panelClass: 'custom-modal-panel'
    });
  }

  toggleSelectAll() {
    this.processedData.forEach(row => {
      row.selected = this.selectAll;
      row.ApprovedAmount = this.selectAll ? row.originalApproved : 0;
    });
    this.selectionChanged.emit({
      name: this.categoryName,
      data: this.processedData
    });
  }

  onRowSelectionChange(row: any) {
    console.log(row)
    row.ApprovedAmount = row.selected ? row.originalApproved : 0;
    this.selectAll = this.processedData.every(r => r.selected);
    this.selectionChanged.emit({
      name: this.categoryName,
      data: this.processedData
    });
  }

  onApprovedAmountChange(row: any) {
    this.selectionChanged.emit({
      name: this.categoryName,
      data: this.processedData
    });
  }

}
