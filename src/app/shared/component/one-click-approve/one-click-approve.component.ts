import { CommonModule } from '@angular/common';
import { Component, Inject, Optional, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ExpenseService } from '../../../../../tne-api';
import { SnackbarService } from '../../service/snackbar.service';
import { DecimalFormatPipe } from '../../pipes/decimal-format.pipe';

@Component({
  selector: 'app-one-click-approve',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    DecimalFormatPipe
  ],
  templateUrl: './one-click-approve.component.html',
  styleUrl: './one-click-approve.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OneClickApproveComponent {
  approveData: any[] = [];
  public remarks: string = '';
  isReject = false;
  isSeekClarification = false;
  title = 'One Click Approval';
  buttonText = 'Approve';

  constructor(
    @Optional() public dialogRef: MatDialogRef<OneClickApproveComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { selectedRequest: any[]; isReject?: boolean; isSeekClarification?: boolean } | null,
    private expenseService: ExpenseService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.isReject = this.data?.isReject || false;
    this.isSeekClarification = this.data?.isSeekClarification || false;
    if (this.isReject) {
      this.title = 'One Click Rejection';
      this.buttonText = 'Reject';
    } else if (this.isSeekClarification) {
      this.title = 'One Click Seek Clarification';
      this.buttonText = 'Seek Clarification';
    }
    if (this.data && this.data.selectedRequest) {
      this.approveData = this.data.selectedRequest;
    }
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  approve() {
    if (this.isReject) {
      const rejectPayload = {
        ExpenseRequestId: this.approveData[0]?.ExpenseRequestId || 0,
        Remarks: this.remarks,
        ApprovalAction: 115,
        ActionBy: Number(localStorage.getItem('userMasterId'))
      }
      console.log(rejectPayload);

      this.expenseService.expenseExpenseRequestApprovals(rejectPayload).subscribe({
        next: (response: any) => {
          // Handle successful rejection
          if (response?.ResponseValue) {
            if (response?.ResponseValue?.Result == 'SUCCESS') {
              this.snackbarService.success('One Click rejection successful');
            } else {
              this.snackbarService.error(response?.ResponseValue?.Message || 'One Click rejection failed');
            }
            this.close();
          } else {
            this.snackbarService.error('One Click rejection failed');
          }
        },
        error: (error) => {
          // Handle error
          this.snackbarService.error('One Click rejection failed');
        }
      });
    } else if (this.isSeekClarification) {
      const seekClarificationPayload = {
        ExpenseRequestId: this.approveData[0]?.ExpenseRequestId || 0,
        Remarks: this.remarks,
        ApprovalAction: 114,
        ActionBy: Number(localStorage.getItem('userMasterId'))
      }
      console.log(seekClarificationPayload);

      this.expenseService.expenseExpenseRequestApprovals(seekClarificationPayload).subscribe({
        next: (response: any) => {
          // Handle successful rejection
          if (response?.ResponseValue) {
            if (response?.ResponseValue?.Result == 'SUCCESS') {
              this.snackbarService.success('One Click Seek Clarification successful');
            } else {
              this.snackbarService.error(response?.ResponseValue?.Message || 'One Click Seek Clarification failed');
            }
            this.close();
          } else {
            this.snackbarService.error('One Click Seek Clarification failed');
          }
        },
        error: (error) => {
          // Handle error
          this.snackbarService.error('One Click Seek Clarification failed');
        }
      });
    } else {
      let requestBody = {
        ExpenseRequestIdType: this.approveData.map(approval => ({
          RequestId: approval.ExpenseRequestId
        })),
        Remarks: this.remarks,
        ActionBy: Number(localStorage.getItem('userMasterId')) || 0
      };
      console.log(requestBody);
      this.expenseService.expenseExpenseRequestBulkApprovals(requestBody).subscribe({
        next: (response: any) => {
          // Handle successful approval
          if (response?.ResponseValue) {
            if (response?.ResponseValue?.Result == 'SUCCESS') {
              this.snackbarService.success('One Click approval successful');
            } else {
              this.snackbarService.error(response?.ResponseValue?.Message || 'One Click approval failed');
            }
            this.close();
          } else {
            this.snackbarService.error('One Click approval failed');
          }

        },
        error: (error) => {
          // Handle error
          this.snackbarService.error('One Click approval failed');
        }
      });
    }
  }

}
