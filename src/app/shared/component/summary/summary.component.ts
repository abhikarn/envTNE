 import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnChanges {

  @Input() summaries: any;
  @Input() expenseRequestData: any;
  totalExpense: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate cost center summary when input changes
    if (changes['summaries'] || changes['expenseRequestData']) {
      this.calculateCostCenterWiseExpense();
    }
  }

  toggleAccordion(activeId: string): void {
    // Toggle the accordion open state for the clicked item
    this.summaries = this.summaries.map((summary: any) => {
      if (summary.id === activeId) {
        return { ...summary, isOpen: !summary.isOpen }; // Toggle the current one
      }
        // Close all other accordions
    return { ...summary, isOpen: false };
  });
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

    // Set adjustments value from expenseRequestAdjustment[0]?.adjustmentAmount if available (array support)
    let adjustmentAmount = 0;
    if (Array.isArray(this.expenseRequestData?.expenseRequestAdjustment) && this.expenseRequestData.expenseRequestAdjustment.length > 0) {
      adjustmentAmount = Number(this.expenseRequestData.expenseRequestAdjustment[0].adjustmentAmount) || 0;
    } else if (this.expenseRequestData?.expenseRequestAdjustment?.adjustmentAmount) {
      adjustmentAmount = Number(this.expenseRequestData.expenseRequestAdjustment.adjustmentAmount) || 0;
    }
    const adjustmentsItem = summary.items?.find((item: any) => item.name === 'adjustments');
    if (adjustmentsItem) {
      adjustmentsItem.value = adjustmentAmount.toFixed(2);
    }

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
      // Add adjustment amount to totalExpense if this is the adjustments item
      if (item.name === 'adjustments') {
        totalExpense += Number(item.value);
      }
      // Ensure value is in 2 decimal places
      item.value = value.toFixed(2);
    });

    // Set totalExpense and amountPayable
    summary.items?.forEach((item: any) => {
      if (item.name === 'totalExpense') {
        item.value = totalExpense.toFixed(2);
        this.totalExpense = totalExpense;
      }
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
            const { ApprovedAmountInBaseCurrency, ClaimAmountInBaseCurrency } = request?.excludedData || request || {};
            totalCategoryExpense = totalCategoryExpense + Number(ApprovedAmountInBaseCurrency || ClaimAmountInBaseCurrency || 0);
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

  calculateCostCenterWiseExpense() {
    const COST_CENTER_WISE_EXPENSE_ID = "cost-center-wise-expense";
    const summary = this.summaries?.find((s: any) => s.id === COST_CENTER_WISE_EXPENSE_ID);
    if (!summary) return;

    // Initialize summary items as empty
    summary.items = [];

    // First pass: collect unique cost center names
    const uniqueCostCenters = new Set<string>();

    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      expenseRequest?.data?.forEach((request: any) => {
        request?.costcentreWiseExpense?.forEach((costCenter: any) => {
          uniqueCostCenters.add(costCenter.CostCentre);
        });
      });
    });

    // Initialize summary.items with unique cost centers
    uniqueCostCenters.forEach((costCenterName) => {
      summary.items.push({
        label: costCenterName,
        value: 0.00,
        showInUI: true
      });
    });

    // Second pass: sum up AmmoutInActual for each cost center
    this.expenseRequestData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      expenseRequest?.data?.forEach((request: any) => {
        request?.costcentreWiseExpense?.forEach((costCenter: any) => {
          const costCenterName = costCenter.CostCentre;
          const amount = Number(costCenter?.AmmoutInActual) || 0;

          const item = summary.items.find((item: any) => item.label === costCenterName);
          if (item) {
            item.value = (Number(item.value) + amount).toFixed(2);
          }
        });
      });
    });
  }
}
