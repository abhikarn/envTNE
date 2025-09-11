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

  constructor(
    @Optional() public dialogRef: MatDialogRef<OneClickApproveComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { selectedRequest: any[] } | null,
    private expenseService: ExpenseService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
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
        if(response?.ResponseValue) {
          if(response?.ResponseValue?.Result == 'SUCCESS') {
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
