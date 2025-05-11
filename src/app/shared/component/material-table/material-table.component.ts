import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AddGstComponent } from '../../dynamic-form/form-controls/gst/add-gst/add-gst.component';
import { GlobalDatePipe } from '../../pipes/global-date.pipe';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    AddGstComponent,
    GlobalDatePipe
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.scss',
  providers: [DatePipe]
})
export class MaterialTableComponent implements OnChanges {
  @Input() categoryName: string = '';
  @Input() data: any[] = [];
  @Input() columnConfig: any[] = [];
  @Input() slNoLabel: string = 'Sl. No.';
  @Input() nestedTables: any[] = [];
  @Input() mode: 'preview' | 'approval' | 'finance-approval' = 'preview';
  @Input() categoryGST: any;
  @Output() selectionChanged = new EventEmitter<any>();
  selectAll: boolean = false;

  expandedRow: any | null = null;
  processedData: any[] = [];

  constructor(
    private dialog: MatDialog,
    private confirmDialogService: ConfirmDialogService
  ) { }

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

  get visibleTabelColumns() {
    return (this.columnConfig || []).filter((c: any) => c.visible && !!c.name && c.position == 'in');
  }

  get visibleOtherColumns() {
    return (this.columnConfig || []).filter((c: any) => c.visible && !!c.name && c.position == 'out');
  }

  get columnKeys() {
    return this.visibleTabelColumns?.map((c: any) => c.name);
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

  showRemarks(expenseRequestDetailId: any) {
    console.log(expenseRequestDetailId)
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

  preventInvalidKeys(event: KeyboardEvent): void {
    const invalidKeys = ['-', '+', 'e', 'E'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  enforceLimit(event: Event, row: any, key: string): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value || '0', 10);

    if (isNaN(value)) {
      value = 0;
    }

    // Clamp the value
    if (value < 0) value = 0;
    if (value > 9999999999) value = 9999999999;

    // Update both view and model
    input.value = value.toString();
    row[key] = value;
  }

  validateApprovedAmount(row: any): void {
    const approved = +row.ApprovedAmount;
    const claimed = +row.ClaimAmount;

    if (approved > claimed) {
      this.confirmDialogService
        .confirm({
          title: 'Approved amount',
          message: 'Approved amount should not be greater than claimed amount!',
          confirmText: 'Ok',
          cancelText: ''
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            row.ApprovedAmount = 0;
          }
        });
    }
  }

}
