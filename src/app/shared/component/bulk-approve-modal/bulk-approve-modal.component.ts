import { CommonModule } from '@angular/common';
import { Component, Inject, Optional, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';
import { ExpenseService } from '../../../../../tne-api';
import { SnackbarService } from '../../service/snackbar.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bulk-approve-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    DecimalFormatPipe,
    FormsModule
  ],
  templateUrl: './bulk-approve-modal.component.html',
  styleUrl: './bulk-approve-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BulkApproveModalComponent {
  bulkApproveData: any[] = [];
  public remarks: string = '';

  constructor(
    @Optional() public dialogRef: MatDialogRef<BulkApproveModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { selectedRequests: any[] } | null,
    private expenseService: ExpenseService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.selectedRequests) {
      this.bulkApproveData = this.data.selectedRequests;
    }
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  get totalApprovedAmount(): number {
    return (this.bulkApproveData || []).reduce(
      (sum, approval) => sum + (approval?.ApprovedAmount || 0),
      0
    );
  }

  approve() {
    let requestBody = {
      ExpenseRequestIdType: this.bulkApproveData.map(approval => ({
        RequestId: approval.ExpenseRequestId
      })),
      Remarks: this.remarks
    };
    console.log(requestBody);
    debugger
    this.expenseService.expenseExpenseRequestBulkApprovals(requestBody).subscribe({
      next: (response: any) => {
        // Handle successful approval
        if(response?.ResponseValue) {
          if(response?.ResponseValue?.Result == 'SUCCESS') {
            this.snackbarService.success('Bulk approval successful');
          } else {
            this.snackbarService.error(response?.ResponseValue?.Message || 'Bulk approval failed');
          }
          this.close();
        }
        
      },
      error: (error) => {
        // Handle error
        this.snackbarService.error('Bulk approval failed');
      }
    });

  }

}
