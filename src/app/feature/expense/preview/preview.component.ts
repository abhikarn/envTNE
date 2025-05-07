import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ExpansionPanelComponent } from '../../../shared/component/expansion-panel/expansion-panel.component';
import { MaterialTableComponent } from '../../../shared/component/material-table/material-table.component';
import { RequesterDetailsDialogComponent } from '../../../shared/component/requester-details-dialog/requester-details-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { NewExpenseService } from '../service/new-expense.service';
import { take } from 'rxjs';
import { SummaryComponent } from '../../../shared/component/summary/summary.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'app-preview',
  imports: [
    CommonModule,
    ExpansionPanelComponent,
    MaterialTableComponent,
    SummaryComponent,
    MatTabsModule
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  @ViewChild(SummaryComponent) summaryComponent: any;
  expenseRequestPreviewData: any;

  expenseRequestPreviewConfig: any;

  loadData = false;
  expenseRequestId: any;
  requestorId: any;
  requestHeaderDetails: any;
  requestDetails: any;
  expenseSummary: any;
  otherDetails: any;
  otherFields: any;
  mode: 'preview' | 'approval' | 'finance-approval' = 'preview';

  constructor(
    private route: ActivatedRoute,
    private newExpenseService: NewExpenseService,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {

  }

  openDetailsDialog(id: number): void { 
    debugger; 
    let requestBody = {
      expenseRequestId: this.expenseRequestId
    }
    this.newExpenseService.getExpenseRequestDetailPreview(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {
        if (response) {
          this.requestorId=response.requesterId
          const body = {
            UserMasterId: this.requestorId,
          };
          this.newExpenseService.getRequestorInfo(body).subscribe({
            next: (response) => {
              if (response?.ResponseCode === 200) {
                this.dialog.open(RequesterDetailsDialogComponent, {
                  width: '1300px',
                  maxWidth: '100vw',
                  panelClass: 'custom-dialog-container',
                  data: response.ResponseValue
                });
              }
            }
          });
        }
      }
    });      
  }

  getExpenseConfig() {
    this.newExpenseService.getExpenseConfig().pipe(take(1)).subscribe({
      next: (response: any) => {
        if (response) {
          this.expenseRequestPreviewConfig = response.expenseRequestPreviewAndApproval;
          this.otherDetails = response.expenseRequest.otherDetails;
          this.expenseSummary = response.expenseRequest.summaries;
        }
      }
    });
  }

  getExpenseRequestPreviewDetails() {    
    let requestBody = {
      expenseRequestId: this.expenseRequestId
    }
    this.newExpenseService.getExpenseRequestDetailPreview(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {
        if (response) {
          this.expenseRequestPreviewData = response;
          this.loadExpenseRequestPreviewData();
        }
      }
    });
  }

  loadExpenseRequestPreviewData() {
    if (!this.loadData) {
      
      this.requestHeaderDetails = this.expenseRequestPreviewConfig?.requestHeaderDetails;
      this.requestorId = this.requestHeaderDetails.requesterId
      const requestData = this.expenseRequestPreviewData;
      this.requestHeaderDetails?.forEach((config: any) => {
        const prop = config.name;
        if (requestData && requestData.hasOwnProperty(prop)) {
          config.value = requestData[prop];
        }
      });
      this.requestHeaderDetails?.sort((a: any, b: any) => a.order - b.order);

      this.requestDetails = this.expenseRequestPreviewConfig?.requestDetails;
      const requestDeatilData = this.expenseRequestPreviewData;
      this.requestDetails?.forEach((config: any) => {
        const prop = config.name;
        if (requestDeatilData && requestDeatilData.hasOwnProperty(prop)) {
          config.value = requestDeatilData[prop];
        }
      });
      this.requestDetails?.sort((a: any, b: any) => a.order - b.order);

      this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((configData: any) => {
        this.expenseRequestPreviewData.dynamicExpenseDetailModels?.forEach((previewData: any) => {
          if (configData?.name == previewData.name) {
            configData.data = previewData.data;
            this.otherFields = configData?.otherFields?.map((field: any) => {
              const value = previewData.data[0]?.[field.name] ?? '';
              return {
                ...field,
                value: value
              };
            })
          }
        })
      })
      setTimeout(() => {
        this.calculatTotalExpenseAmountPreview();
        this.setCategoryWiseAmount();
      }, 1000);
      this.loadData = true;
    }
  }

  ngOnInit() {
    
    this.expenseRequestId = this.route.snapshot.paramMap.get('id') || 0;
    if (this.expenseRequestId) {
      this.getExpenseConfig();
      this.getExpenseRequestPreviewDetails();
    }
    const segments = this.route.snapshot.url;
    const segment = segments[0]?.path;
    if(segment == 'approval') {
      this.mode = 'approval';
    }
    if(segment == 'finance-approval') {
      this.mode = 'finance-approval';
    }
  }

  setCategoryWiseAmount() {
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense";
    const categoryWiseExpense = this.expenseSummary?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!categoryWiseExpense) return;

    // Distribute totalExpense to the matched category
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      const categoryName = expenseRequest.name;
      const matchedItem = categoryWiseExpense.items?.find((item: any) => item.key === categoryName);
      if (matchedItem) {
        expenseRequest.amount = (matchedItem.value).toFixed(2);
      }
    });
  }

  calculatTotalExpenseAmountPreview() {
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense"
    const TOTAL_EXPENSE_KEYS = [91, 92, 93, 94];
    const PAYABLE_KEYS = [91, 94];
    let CATEGORY_NAME = '';

    const summary = this.expenseSummary?.find((s: any) => s.id === EXPENSE_SUMMARY_ID);
    if (!summary) return;

    // Reset all values to 0.00
    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    // Add claim amounts to respective payment modes
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      CATEGORY_NAME = expenseRequest.name;
      expenseRequest.data?.forEach((request: any) => {
        const { PaymentModeId, ClaimAmount } = request || {};
        this.updateExpenseItem(summary, PaymentModeId, ClaimAmount);
      });
    });

    // Calculate totals
    let totalExpense = 0.00;
    let amountPayable = 0.00;

    summary.items?.forEach((item: any) => {
      const value = Number(item.value);
      if (TOTAL_EXPENSE_KEYS.includes(item.paymentModeId)) {
        totalExpense += value;
      }
      if (PAYABLE_KEYS.includes(item.paymentModeId)) {
        amountPayable += value;
      }
      // Ensure value is in 2 decimal places
      item.value = value.toFixed(2);
    });

    // Set totalExpense and amountPayable
    summary.items?.forEach((item: any) => {
      if (item.key === 'totalExpense') item.value = totalExpense.toFixed(2);
      if (item.key === 'amountPayable') item.value = amountPayable.toFixed(2);
    });

    // Category wise expense logic
    const categoryWiseExpense = this.expenseSummary?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!categoryWiseExpense) return;

    // Reset all values to 0.00
    categoryWiseExpense.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    categoryWiseExpense.items?.forEach((item: any) => {
      if (item.key == CATEGORY_NAME) {
        item.value = totalExpense;
      }
    });
  }

  updateExpenseItem(summary: any, paymentModeId: any, amount: any) {
    const targetItem = summary.items?.find((item: any) => item.paymentModeId === paymentModeId);
    if (targetItem) {
      const currentValue = Number(targetItem.value) || 0;
      const addedValue = Number(amount) || 0;
      targetItem.value = (currentValue + addedValue).toFixed(2);
    }
  }

  getSelection(category: any) {
    let dynamicExpenseDetailModels = this.expenseRequestPreviewData?.dynamicExpenseDetailModels || [];
    dynamicExpenseDetailModels?.forEach((cat: any) => {
      if(cat?.name == category?.name) {
        cat.data = category?.data || [];
      }
    })
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense"
    const TOTAL_EXPENSE_KEYS = [91, 92, 93, 94];
    const PAYABLE_KEYS = [91, 94];
    let CATEGORY_NAME = '';

    const summary = this.expenseSummary?.find((s: any) => s.id === EXPENSE_SUMMARY_ID);
    if (!summary) return;

    // Reset all values to 0.00
    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    // Add claim amounts to respective payment modes
    dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      CATEGORY_NAME = expenseRequest.name;
      expenseRequest.data?.forEach((request: any) => {
        const { PaymentModeId, ApprovedAmount, selected } = request || {};
        if(selected) {
          this.updateExpenseItem(summary, PaymentModeId, ApprovedAmount);
        }
      });
    });

    // Calculate totals
    let totalExpense = 0.00;
    let amountPayable = 0.00;

    summary.items?.forEach((item: any) => {
      const value = Number(item.value);
      if (TOTAL_EXPENSE_KEYS.includes(item.paymentModeId)) {
        totalExpense += value;
      }
      if (PAYABLE_KEYS.includes(item.paymentModeId)) {
        amountPayable += value;
      }
      // Ensure value is in 2 decimal places
      item.value = value.toFixed(2);
    });

    // Set totalExpense and amountPayable
    summary.items?.forEach((item: any) => {
      if (item.key === 'totalExpense') item.value = totalExpense.toFixed(2);
      if (item.key === 'amountPayable') item.value = amountPayable.toFixed(2);
    });

    // Category wise expense logic
    const categoryWiseExpense = this.expenseSummary?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!categoryWiseExpense) return;

    // Reset all values to 0.00
    categoryWiseExpense.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    categoryWiseExpense.items?.forEach((item: any) => {
      if (item.key == CATEGORY_NAME) {
        item.value = totalExpense;
      }
    });

    this.setCategoryWiseAmount();
    dynamicExpenseDetailModels = [];
  }

  onAction(type: string) {
    console.log(type)
  }
}
