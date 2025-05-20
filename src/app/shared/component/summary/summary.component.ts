import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {

  @Input() summaries: any;
  @Input() expenseRequestData: any;


  toggleAccordion(activeId: string): void {
    this.summaries = this.summaries.map((summary: any) => ({
      ...summary,
      isOpen: summary.id === activeId
    }));
  }

  calculatTotalExpenseAmount() {
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const TOTAL_EXPENSE_KEYS = [91, 92, 93, 94];
    const PAYABLE_KEYS = [91, 94];
    let CATEGORY_NAME = '';

    const summary = this.summaries?.find((s: any) => s.id === EXPENSE_SUMMARY_ID);
    if (!summary) return;

    // Reset all values to 0.00
    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    // Add claim amounts to respective payment modes
    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      CATEGORY_NAME = expenseRequest.name;
      expenseRequest.data?.forEach((request: any) => {
        const { PaymentMode, ClaimAmountInBaseCurrency } = request?.excludedData || request || {};
        this.updateExpenseItem(summary, PaymentMode, ClaimAmountInBaseCurrency);
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
      if (item.name === 'totalExpense') item.value = totalExpense.toFixed(2);
      if (item.name === 'amountPayable') item.value = amountPayable.toFixed(2);
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

  calculatCategoryWiseExpense() {
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense";
    let CATEGORY_NAME = '';

    const summary = this.summaries?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!summary) return;

    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    // Add claim amounts to respective payment modes
    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      CATEGORY_NAME = expenseRequest.name;
      summary?.items?.forEach((item: any) => {
        if (item.name == CATEGORY_NAME) {
          let totalCategoryExpense = 0;
          expenseRequest.data?.forEach((request: any) => {
            const { ClaimAmountInBaseCurrency } = request?.excludedData || request || {};
            totalCategoryExpense = totalCategoryExpense + Number(ClaimAmountInBaseCurrency);
          });
          item.value = totalCategoryExpense.toFixed(2);
        }
      })
    });
    this.setCategoryWiseAmount();
  }

  setCategoryWiseAmount() {
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense";
    const categoryWiseExpense = this.summaries?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!categoryWiseExpense) return;
    this.updateTotalAmount(categoryWiseExpense);

    // Distribute totalExpense to the matched category
    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      const categoryName = expenseRequest.name;
      const matchedItem = categoryWiseExpense.items?.find((item: any) => item.name === categoryName);
      if (matchedItem) {
        expenseRequest.amount = matchedItem.value;
      }
    });
  }

  updateTotalAmount(categoryExpense: any) {
    const total = categoryExpense.items
      .filter((item: any) => item.name !== 'Total')
      .reduce((sum: number, item: any) => sum + parseFloat(item.value || '0'), 0);

    const totalItem = categoryExpense.items.find((item: any) => item.name === 'Total');
    if (totalItem) {
      totalItem.value = total.toFixed(2); // Keep it as string with 2 decimals
    }
  }

}
