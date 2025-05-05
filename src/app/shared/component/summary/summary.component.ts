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
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense"
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
        const { PaymentMode, ClaimAmount } = request?.excludedData || {};
        this.updateExpenseItem(summary, PaymentMode, ClaimAmount);
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
    const categoryWiseExpense = this.summaries?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
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

  calculatTotalExpenseAmountPreview() {
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense"
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
    const categoryWiseExpense = this.summaries?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
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
}
