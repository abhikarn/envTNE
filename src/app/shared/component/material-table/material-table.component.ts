import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// Add import for MatBottomSheet
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AddGstComponent } from '../../dynamic-form/form-controls/gst/add-gst/add-gst.component';
import { GlobalDatePipe } from '../../pipes/global-date.pipe';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';
import { GlobalConfigService } from '../../service/global-config.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

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
    GlobalDatePipe,
    MatDialogModule,
    MatBottomSheetModule
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.scss',
  encapsulation: ViewEncapsulation.None,
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
  @Output() emitExpenseRequestDetailId = new EventEmitter<any>();
  selectAll: boolean = false;

  expandedRow: any | null = null;
  processedData: any[] = [];

  constructor(
    private dialog: MatDialog,
    // Inject MatBottomSheet
    private bottomSheet: MatBottomSheet,
    private confirmDialogService: ConfirmDialogService,
    private configService: GlobalConfigService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const decimalPrecision = this.configService.getDecimalPrecision ? this.configService.getDecimalPrecision() : 2;
    // Update processedData when input changes
    if (this.data?.length > 0) {
      this.processedData = this.data.map((row, index) => ({
        ...row,
        slNo: index + 1,
        selected: row.ClaimStatusId == 5 ? false : true,
        originalApproved: row.ClaimStatusId == 5
          ? '0'
          : parseFloat(row.ApprovedAmount == 0 ? row.ClaimAmount : row.ApprovedAmount || '0').toFixed(decimalPrecision),
        ApprovedAmount: row.ClaimStatusId == 5
          ? '0'
          : parseFloat(row.ApprovedAmount == 0 ? row.ClaimAmount : row.ApprovedAmount || '0').toFixed(decimalPrecision),
        remarks: row.remarks || ''
      }));
    } else {
      this.processedData = [];
    }
    // selectAll should be true only if there is at least one selectable row and all selectable rows are selected
    const selectableRows = this.processedData;
    this.selectAll = selectableRows.length > 0 && selectableRows.every(r => r.selected);
  }

  ngOnInit() {
    
    console.log(this.nestedTables)
    this.setDecimalPrecision();
    // selectAll should be true only if there is at least one selectable row and all selectable rows are selected
    const selectableRows = this.processedData;
    this.selectAll = selectableRows.length > 0 && selectableRows.every(r => r.selected); 
  }

  setDecimalPrecision() {
    this.columnConfig.forEach((column: any) => {
      if (column.type === 'number') {
        this.processedData.forEach((row: any) => {
          if (row[column.name] !== undefined) {
            row[column.name] = parseFloat(row[column.name]).toFixed(column.decimalPrecision || this.configService.getDecimalPrecision());
          }
        });
      }
    });
    this.nestedTables.forEach((nestedTable: any) => {
      nestedTable.columns.forEach((column: any) => {
        if (column.type === 'number') {
          this.processedData.forEach((row: any) => {
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectionChanged.emit({
        name: this.categoryName,
        data: this.processedData
      });
    });
  }

  getSelectedData() {
    return {
      name: this.categoryName,
      data: this.processedData
    };
  }

  // get visibleTabelColumns() {
  //   return (this.columnConfig || []).filter((c: any) => c.visible && !!c.name && c.position == 'in');
  // }

  // get visibleOtherColumns() {
  //   return (this.columnConfig || []).filter((c: any) => c.visible && !!c.name && c.position == 'out');
  // }

  get visibleTabelColumns() {
    return (this.columnConfig || []).filter(
      (c: any) => c.visible && !!c.name && (c.position === 'in' || c.position === 'in-out')
    );
  }

  get visibleOtherColumns() {
    return (this.columnConfig || []).filter(
      (c: any) => c.visible && !!c.name && (c.position === 'out' || c.position === 'in-out')
    );
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

  // Utility to detect mobile devices
  private isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  showAttachments(attachments: any[]) {
    if (!attachments || attachments.length === 0) return;
    if (this.isMobile()) {
      this.bottomSheet.open(AttachmentModalComponent, {
        data: { attachments },
        panelClass: 'custom-modal-panel'
      });
    } else {
      this.dialog.open(AttachmentModalComponent, {
        width: '1000px',
        data: { attachments },
        panelClass: 'custom-modal-panel'
      });
    }
  }

  showRemarks(row: any) {
    this.emitExpenseRequestDetailId.emit(row);
  }

  toggleSelectAll() {
    this.processedData.forEach(row => {
      if (row.ClaimStatusId !== 5) {
        row.selected = this.selectAll;
        row.ApprovedAmount = this.selectAll ? row.originalApproved : 0;
      }
    });
    this.selectionChanged.emit({
      name: this.categoryName,
      data: this.processedData
    });
  }

  onRowSelectionChange(row: any) {
    
    const decimalPrecision = this.configService.getDecimalPrecision ? this.configService.getDecimalPrecision() : 2;
    row.ApprovedAmount = row.selected ? (parseFloat(row.originalApproved || '0').toFixed(decimalPrecision)) : 0;
    // selectAll should be true only if there is at least one selectable row and all selectable rows are selected
    const selectableRows = this.processedData;
    this.selectAll = selectableRows.length > 0 && selectableRows.every(r => r.selected);
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

  enforceLimit(event: Event, row: any, key: string, maxLength: number = 10, decimalPrecision: number = 2): void {
    const input = event.target as HTMLInputElement;
    let inputValue = (input.value || '').toString();

    // Remove all non-numeric and non-decimal characters, allow only one decimal point
    inputValue = inputValue.replace(/[^0-9.]/g, '');

    // Prevent more than one decimal point
    const parts = inputValue.split('.');
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit integer and decimal part lengths
    const [integerPart, decimalPart] = inputValue.split('.');
    let formattedValue = integerPart ? integerPart.slice(0, maxLength) : '';
    if (decimalPart !== undefined) {
      formattedValue += '.' + decimalPart.slice(0, decimalPrecision);
    }

    // Update both view and model (do not format to fixed here, only on blur)
    input.value = formattedValue;
    row[key] = formattedValue;

    // Real-time calculation for ClaimAmountInBaseCurrency
    if (key === 'ApprovedAmount') {
      const approvedAmount = parseFloat(formattedValue) || 0;
      const conversionRate = parseFloat(row['ConversionRate']) || 0;
      row['ClaimAmountInBaseCurrency'] = (approvedAmount * conversionRate).toFixed(decimalPrecision);
    }
  }

  onAmountBlur(event: Event, row: any, key: string, decimalPrecision: number = 2): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Format value to required decimal precision on blur
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const formatted = numericValue.toFixed(decimalPrecision);
      input.value = formatted;
      row[key] = formatted;

      // Recalculate ClaimAmountInBaseCurrency if ApprovedAmount is changed
      if (key === 'ApprovedAmount') {
        const approvedAmount = parseFloat(formatted) || 0;
        const conversionRate = parseFloat(row['ConversionRate']) || 0;
        row['ClaimAmountInBaseCurrency'] = (approvedAmount * conversionRate).toFixed(decimalPrecision);
      }

      // If value is 0.00, prompt for rejection confirmation
      if (parseFloat(formatted) === 0) {
        this.confirmDialogService
          .confirm({
            title: 'Reject Line Item',
            message: 'This line item will be treated as rejected. Are you sure you want to reject?',
            confirmText: 'Yes',
            cancelText: 'No'
          })
          .subscribe((confirmed) => {
            if (confirmed) {
              // Unselect the row and require remarks
              row.selected = false;
              if (!row.remarks || row.remarks.trim() === '') {
                row.remarks = '';
              }
            } else {
              // Restore previous value if cancelled, with decimal format
              const prev = parseFloat(row.originalApproved || '0').toFixed(decimalPrecision);
              row[key] = prev;
              input.value = prev;

              // Restore ClaimAmountInBaseCurrency as well
              if (key === 'ApprovedAmount') {
                const approvedAmount = parseFloat(prev) || 0;
                const conversionRate = parseFloat(row['ConversionRate']) || 0;
                row['ClaimAmountInBaseCurrency'] = (approvedAmount * conversionRate).toFixed(decimalPrecision);
              }
            }
          });
      }
    } else {
      input.value = '';
      row[key] = '';
      // Also clear ClaimAmountInBaseCurrency if ApprovedAmount is cleared
      if (key === 'ApprovedAmount') {
        row['ClaimAmountInBaseCurrency'] = '';
        // Unselect the row and require remarks if ApprovedAmount is removed
        row.selected = false;
        if (!row.remarks || row.remarks.trim() === '') {
          row.remarks = '';
        }
      }
    }
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
          cancelButton: false
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            row.ApprovedAmount = 0;
          }
          // Realtime calculation after validation
          const approvedAmount = parseFloat(row.ApprovedAmount) || 0;
          const conversionRate = parseFloat(row['ConversionRate']) || 0;
          row['ClaimAmountInBaseCurrency'] = (approvedAmount * conversionRate).toFixed(2);
        });
    } else {
      // Always recalculate even if not greater
      const approvedAmount = parseFloat(row.ApprovedAmount) || 0;
      const conversionRate = parseFloat(row['ConversionRate']) || 0;
      row['ClaimAmountInBaseCurrency'] = (approvedAmount * conversionRate).toFixed(2);
    }
  }

  isRemarkInvalid(row: any): boolean {
    return (this.mode === 'approval' || this.mode === 'finance-approval') && !row.selected && (!row.remarks || row.remarks.trim() === '');
  }

  get hasSelectableRows(): boolean {
    return this.processedData?.some(r => r.claimStatusId !== 5) ?? false;
  }

  getRowClass(row: any) {
    const classes: any = {};
    if (row?.ClaimStatusId === 5) {
      classes['disabled-row'] = true;
    }
    if (row?.IsViolation) {
      classes['violation-row'] = true;
    } else if (row?.IsOCRRestrictedKeyword) {
      classes['ocr-riestricted-row'] = true;
    }
    return classes;
  }
}
