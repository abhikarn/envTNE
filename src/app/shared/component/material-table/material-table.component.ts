import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.scss'
})
export class MaterialTableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columnConfig: any[] = [];
  @Input() slNoLabel: string = 'Sl. No.';
  @Input() nestedTables: any[] = [];
  @Input() otherFields: any[] = [];

  expandedRow: any | null = null;
  processedData: any[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges) {
    // Update processedData when input changes
    if (this.data?.length > 0) {
      this.processedData = this.data.map((row, index) => ({
        ...row,
        slNo: index + 1
      }));
    } else {
      this.processedData = [];
    }
  }

  ngOnInit() {
  }

  get visibleColumns() {
    return this.columnConfig?.filter((c: any) => c.visible && !!c.name);
  }

  get columnKeys() {
    return this.visibleColumns?.map((c: any) => c.name);
  }

  get displayedColumns(): string[] {
    return ['slNo', ...this.columnKeys, 'expand'];
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

}
