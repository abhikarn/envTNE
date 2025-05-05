import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ExpansionPanelComponent } from '../../../shared/component/expansion-panel/expansion-panel.component';
import { MaterialTableComponent } from '../../../shared/component/material-table/material-table.component';
import { ActivatedRoute } from '@angular/router';
import { NewExpenseService } from '../service/new-expense.service';
import { take } from 'rxjs';
import { SummaryComponent } from '../../../shared/component/summary/summary.component';
import { MatTabsModule } from '@angular/material/tabs';

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
  expenseRequestId: any = 0;
  expenseSummary: any;
  otherDetails: any;
  otherFields: any;

  constructor(
    private route: ActivatedRoute,
    private newExpenseService: NewExpenseService
  ) {

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
        this.summaryComponent.calculatTotalExpenseAmountPreview();
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
}
