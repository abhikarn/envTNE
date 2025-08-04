import { CommonModule } from '@angular/common';
import { Component, QueryList, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ExpansionPanelComponent } from '../../../shared/component/expansion-panel/expansion-panel.component';
import { MaterialTableComponent } from '../../../shared/component/material-table/material-table.component';
import { RequesterDetailsDialogComponent } from '../../../shared/component/requester-details-dialog/requester-details-dialog.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewExpenseService } from '../service/new-expense.service';
import { debounceTime, switchMap, take } from 'rxjs';
import { SummaryComponent } from '../../../shared/component/summary/summary.component';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/service/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService, ExpenseService, FinanceService } from '../../../../../tne-api';
import { FormControlFactory } from '../../../shared/dynamic-form/form-control.factory';
import { IFormControl } from '../../../shared/dynamic-form/form-control.interface';
import { TextInputComponent } from '../../../shared/dynamic-form/form-controls/input-control/text-input.component';
import { SelectInputComponent } from '../../../shared/dynamic-form/form-controls/dropdown/select-input.component';
import { TextAreaInputComponent } from '../../../shared/dynamic-form/form-controls/text-area/text-area-input.component';
import { ConfirmDialogService } from '../../../shared/service/confirm-dialog.service';
import { SnackbarService } from '../../../shared/service/snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { RemarksModalComponent } from '../../../shared/component/remarks-modal/remarks-modal.component';
import { CreateDynamicFormComponent } from '../../../shared/dynamic-form/create-dynamic-form/create-dynamic-form.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTooltip } from '@angular/material/tooltip';
import { A } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-preview',
  imports: [
    CommonModule,
    ExpansionPanelComponent,
    MaterialTableComponent,
    SummaryComponent,
    MatTabsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    CreateDynamicFormComponent,
    MatTooltip,
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class PreviewComponent {
  @ViewChild(CreateDynamicFormComponent) createDynamicFormComponent!: CreateDynamicFormComponent;
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
  requestorDetail: any;
  mode: 'preview' | 'approval' | 'finance-approval' = 'preview';
  pageTitle = 'Travel Expense Request Preview';
  expenseRequestApprovalDetailType: any = [];
  expenseRequestGstType: any = [];
  justificationForm: any = new FormGroup({
    justification: new FormControl('', Validators.required)
  });
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  form: FormGroup = new FormGroup({});
  filteredOptions: any = [];
  billableControl = new FormControl('', Validators.required);
  isCreateAdjustmentform: boolean = false;
  dynamicAdjustmentFormpayload: any = {};
  transactionId: any;

  constructor(
    private route: ActivatedRoute,
    private newExpenseService: NewExpenseService,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private financeService: FinanceService,
    private confirmDialogService: ConfirmDialogService,
    private snackbarService: SnackbarService,
    private router: Router,
    private dataService: DataService,
    private bottomSheet: MatBottomSheet,
    private cdr: ChangeDetectorRef
  ) {

  }
  @ViewChildren(MaterialTableComponent) materialTableComponents!: QueryList<MaterialTableComponent>;

  openDetailsDialog(id: number): void {

    let requestBody = {
      transactionId: this.transactionId
    }
    this.newExpenseService.getExpenseRequestDetailPreview(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {
        if (response) {
          this.requestorId = response.requesterId
          const body = {
            UserMasterId: this.requestorId,
          };
          this.newExpenseService.getRequestorInfo(body).subscribe({
            next: (response) => {
              if (response?.ResponseCode === 200) {
                if (window.innerWidth <= 768) {
                  // Open in bottom sheet for mobile
                  this.bottomSheet.open(RequesterDetailsDialogComponent, {
                    data: response.ResponseValue,
                    panelClass: 'custom-modal-panel'
                  });
                } else {
                  this.dialog.open(RequesterDetailsDialogComponent, {
                    width: '1300px',
                    maxWidth: '100vw',
                    panelClass: 'custom-dialog-container',
                    data: response.ResponseValue
                  });
                }
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
          this.mode == 'preview' || this.mode == 'finance-approval' ? this.setupJustificationForm() : '';
        }
      }
    });
  }

  getExpenseRequestPreviewDetails() {
    let requestBody = {
      transactionId: this.transactionId
    }
    this.newExpenseService.getExpenseRequestDetailPreview(requestBody).pipe(take(1)).subscribe({
      next: (response: any) => {

        if (response) {
          if ([52, 54].includes(response?.claimTypeId)) {
            this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((config: any) => {
              config.columns?.forEach((column: any) => {
                if (column.international == true) {
                  column.visible = true;
                }
                if (column.international == false) {
                  column.visible = false;
                }
              });
            });
          }
          this.expenseRequestId = response?.expenseRequestId;
          this.expenseRequestPreviewData = response;
          this.billableControl.setValue(response?.billableCostcentre || 0);
          this.expenseRequestPreviewData?.dynamicExpenseDetailModels?.forEach((details: any) => {

            details?.data?.forEach((expense: any) => {
              expense.selected = true;
              if (expense?.selected) {
                if (expense.gst?.length > 0) {
                  expense.gst.forEach((gst: any) => {
                    this.expenseRequestGstType.push({
                      ...gst,
                      ExpenseRequestGstTypeId: gst.ExpenseRequestGstId
                    });
                  })
                }
                this.expenseRequestApprovalDetailType.push({
                  ExpenseRequestDetailId: expense?.ExpenseRequestDetailId || 0,
                  ApprovedAmount: expense?.ApprovedAmount || 0,
                  ApproverId: Number(localStorage.getItem('userMasterId')),
                  ApproverRemarks: expense?.remarks || "",
                  ActionStatusId: 6
                });
              }
            });
          })
          this.loadExpenseRequestPreviewData();
          this.expenseRequestPreviewData?.expenseRequestAdjustment?.forEach((adjustment: any) => {
            if (adjustment?.expenseRequestId == this.expenseRequestId) {
              this.setAdjustmentAmount(adjustment?.adjustmentAmountInBaseCurrency || 0);
            }
          });
        }
      }
    });
  }

  loadExpenseRequestPreviewData() {
    if (!this.loadData) {
      this.requestHeaderDetails = this.expenseRequestPreviewConfig?.requestHeaderDetails;
      this.requestorId = this.requestHeaderDetails.requesterId;
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
      //requestorDetail detail
      let requesterDetailData: any
      const body = {
        UserMasterId: requestData.requesterId,
      };
      this.newExpenseService.getRequestorInfo(body).subscribe((data) => {
        requesterDetailData = data.ResponseValue;
        this.requestDetails?.forEach((config: any) => {
          const prop = config.name;
          if (requesterDetailData && requesterDetailData.hasOwnProperty(prop)) {
            config.value = requesterDetailData[prop];
          }
        });
      });
      //requestorDetail detail

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
          }
        })
      });
      if (this.mode == 'preview') {
        this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName).setValue(this.expenseRequestPreviewData?.remarks);
      }
      setTimeout(() => {
        this.calculatTotalExpenseAmountPreview();
        this.calculatCategoryWiseExpensePreview();
        this.calculateCostCenterWiseExpense();
      }, 1000);
      this.loadData = true;
    }
  }

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id') || 0;
    if (this.transactionId) {
      this.getExpenseConfig();
      this.getExpenseRequestPreviewDetails();
    }
    const segments = this.route.snapshot.url;
    const segment = segments[0]?.path;
    if (segment == 'approval') {
      this.mode = 'approval';
      this.pageTitle = 'Travel Expense Request Approval'
    }
    if (segment == 'finance-approval') {
      this.mode = 'finance-approval';
      this.pageTitle = 'Travel Expense Request Finance Approval';
      this.billableControl.valueChanges
        .pipe(
          debounceTime(300),
          switchMap(searchText =>
            this.dataService.dataGetCostCentreAutocomplete({ SearchText: searchText || '' })
          )
        )
        .subscribe({
          next: (res) => {
            this.filteredOptions = res?.ResponseValue || [];
          },
          error: (err) => {
            console.error('Failed to fetch cost centres', err);
            this.filteredOptions = [];
          }
        });
    }
  }

  onOptionSelected(event: any, item: any) {
    const selectedDisplay = event.option.value;
    const selected = this.filteredOptions.find((opt: any) => opt[item.displayKey] === selectedDisplay);

    if (selected) {
      item.value = selected[item.displayKey];
      this.updateBillableCostCentre(selected[item.valueKey]);
    }
  }

  updateBillableCostCentre(billableCostcentreId: number) {
    const payload = {
      UserMasterId: Number(localStorage.getItem('userMasterId')),
      ExpenseRequestId: this.expenseRequestId,
      BillableCostCentreId: billableCostcentreId,
      ActionBy: Number(localStorage.getItem('userMasterId'))
    };

    this.financeService.financeExpenseBillableCostCentreUpdate(payload).subscribe({
      next: (res: any) => {
        if (res?.ResponseValue?.Result == "FAILED") {
          this.snackbarService.error(res?.ResponseValue?.Message);
        } else {
          this.snackbarService.success(res?.ResponseValue?.Message);
        }
      }
    })
  }

  // Setup validation rules for justification text field if required.
  setupJustificationForm() {
    const justificationCfg = this.expenseRequestPreviewConfig.justification;
    if (justificationCfg?.required) {
      this.justificationForm.controls[justificationCfg.controlName].setValidators([
        Validators.required,
        Validators.maxLength(justificationCfg.maxLength || 2000)
      ]);
    }
  }

  setCategoryWiseAmount() {
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense";
    const categoryWiseExpense = this.expenseSummary?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!categoryWiseExpense) return;
    this.updateTotalAmount(categoryWiseExpense);

    // Distribute totalExpense to the matched category
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
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

  calculatTotalExpenseAmountPreview() {

    const EXPENSE_SUMMARY_ID = "expense-summary";
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
      expenseRequest.data?.filter((request: any) => request.ClaimStatusId !== 5 && request.selected == true).forEach((request: any) => {

        // const { PaymentModeId, ClaimAmountInBaseCurrency } = request || {};
        const { PaymentModeId, ApprovedAmountInBaseCurrency, ClaimAmountInBaseCurrency } = request || {};
        this.updateExpenseItem(summary, PaymentModeId, ApprovedAmountInBaseCurrency || ClaimAmountInBaseCurrency || 0);
      });
    });


    // Set adjustments value from expenseRequestAdjustment[0]?.adjustmentAmount if available (array support)
    let adjustmentAmount = 0;
    if (Array.isArray(this.expenseRequestPreviewData?.expenseRequestAdjustment) && this.expenseRequestPreviewData.expenseRequestAdjustment.length > 0) {
      adjustmentAmount = Number(this.expenseRequestPreviewData.expenseRequestAdjustment[0].adjustmentAmount) || 0;
    } else if (this.expenseRequestPreviewData?.expenseRequestAdjustment?.adjustmentAmount) {
      adjustmentAmount = Number(this.expenseRequestPreviewData.expenseRequestAdjustment.adjustmentAmount) || 0;
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
      // Add adjustment amount to totalExpense and amountPayable if this is the adjustments item
      if (item.name === 'adjustments') {
        totalExpense += Number(item.value);
        amountPayable += Number(item.value);
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

  calculatCategoryWiseExpensePreview() {
    const CATEGORY_WISE_EXPENSE_ID = "category-wise-expense";
    let CATEGORY_NAME = '';

    const summary = this.expenseSummary?.find((s: any) => s.id === CATEGORY_WISE_EXPENSE_ID);
    if (!summary) return;

    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    // Add claim amounts to respective payment modes
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      CATEGORY_NAME = expenseRequest.name;
      summary?.items?.forEach((item: any) => {
        if (item.name == CATEGORY_NAME) {
          let totalCategoryExpense = 0;
          // Only sum rows that are selected and not rejected
          expenseRequest.data
            ?.filter((request: any) => request.ClaimStatusId !== 5 && request.selected === true)
            .forEach((request: any) => {
              const { ApprovedAmount } = request?.excludedData || request || {};
              totalCategoryExpense = totalCategoryExpense + Number(ApprovedAmount);
            });
          item.value = totalCategoryExpense.toFixed(2);
        }
      })
    });
    this.calculateCostCenterWiseExpense();
    // Ensure summary component is also updated
    if (this.summaryComponent && typeof this.summaryComponent.calculateCostCenterWiseExpense === 'function') {
      this.summaryComponent.calculateCostCenterWiseExpense();
    }
    this.setCategoryWiseAmount();
  }

  calculateCostCenterWiseExpense() {
    ; // (optional: remove or keep as needed)
    const COST_CENTER_WISE_EXPENSE_ID = "cost-center-wise-expense";
    const summary = this.expenseSummary?.find((s: any) => s.id === COST_CENTER_WISE_EXPENSE_ID);
    if (!summary) return;

    // Initialize summary items as empty
    summary.items = [];

    // First pass: collect unique cost center names
    const uniqueCostCenters = new Set<string>();

    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      expenseRequest?.data?.forEach((request: any) => {
        // Calculate AmmoutInActual for each cost center based on AmmoutInPercentage
        if (Array.isArray(request?.costcentreWiseExpense)) {
          request.costcentreWiseExpense.forEach((costCenter: any) => {
            if (
              typeof costCenter.AmmoutInPercentage === 'number' &&
              typeof request.ApprovedAmountInBaseCurrency === 'number'
            ) {
              // Divide ApprovedAmountInBaseCurrency by AmmoutInPercentage (if AmmoutInPercentage is not zero)
              costCenter.AmmoutInActual = costCenter.AmmoutInPercentage !== 0 ? (Number(request.ApprovedAmount) * Number(request.ConversionRate)) * (costCenter.AmmoutInPercentage / 100.00)
                : 0;
            }
            uniqueCostCenters.add(costCenter.CostCentre);
          });
        }
      });
    });

    // Initialize summary.items with unique cost centers
    uniqueCostCenters.forEach((costCenterName) => {
      summary.items.push({
        label: costCenterName,
        value: 0.00
      });
    });

    // Second pass: sum up AmmoutInActual for each cost center
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      expenseRequest?.data?.forEach((request: any) => {
        if (Array.isArray(request?.costcentreWiseExpense)) {
          request.costcentreWiseExpense.forEach((costCenter: any) => {
            const costCenterName = costCenter.CostCentre;
            const amount = Number(costCenter?.AmmoutInActual) || 0;
            const item = summary.items.find((item: any) => item.label === costCenterName);
            if (item) {
              item.value = (Number(item.value) + amount).toFixed(2);
            }
          });
        }
      });
    });
  }

  getSelection(category: any) {
    this.expenseRequestApprovalDetailType = [];
    this.syncPreviewData(category);
    this.syncPreviewConfig(category);
    this.recalculateExpenseSummary();
    this.calculatCategoryWiseExpensePreview();
    this.prepareGstAndApprovalDetails();
    this.setAdjustmentAmount(
      Number(
        this.createDynamicFormComponent?.form?.get('AdjustmentAmount')?.value ||
        this.dynamicAdjustmentFormpayload?.AdjustmentAmount ||
        0
      )
    );
  }

  private syncPreviewData(category: any) {
    let dynamicExpenseDetailModels = this.expenseRequestPreviewData?.dynamicExpenseDetailModels || [];
    dynamicExpenseDetailModels.forEach((cat: any) => {
      if (cat?.name === category?.name) {
        cat.data = category?.data || [];
      }
    });
  }

  private syncPreviewConfig(category: any) {
    this.expenseRequestPreviewConfig?.dynamicExpenseDetailModels?.forEach((cat: any) => {
      if (cat?.name === category?.name) {
        (cat.data || []).forEach((row: any) => {
          const updatedRow = (category?.data || []).find((r: any) =>
            (r.ExpenseRequestDetailId && row.ExpenseRequestDetailId && r.ExpenseRequestDetailId === row.ExpenseRequestDetailId) ||
            (r.slNo && row.slNo && r.slNo === row.slNo)
          );
          if (updatedRow) {
            row.selected = updatedRow.selected;
            row.ApprovedAmount = updatedRow.ApprovedAmount;
            row.remarks = updatedRow.remarks;
            row.approvedAmountInBaseCurrency = updatedRow.ApprovedAmountInBaseCurrency;
          }
        });
      }
    });
  }

  private recalculateExpenseSummary() {
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const TOTAL_EXPENSE_KEYS = [91, 92, 93, 94];
    const PAYABLE_KEYS = [91, 94];

    const summary = this.expenseSummary?.find((s: any) => s.id === EXPENSE_SUMMARY_ID);
    if (!summary) return;

    // Reset values
    summary.items?.forEach((item: any) => {
      item.value = 0.00;
    });

    this.expenseRequestPreviewData?.dynamicExpenseDetailModels?.forEach((expenseRequest: any) => {
      expenseRequest.data?.filter((request: any) => request.ClaimStatusId !== 5 && request.selected)?.forEach((request: any) => {
        const { PaymentModeId, ApprovedAmountInBaseCurrency, ClaimAmountInBaseCurrency } = request;
        this.updateExpenseItem(summary, PaymentModeId, ApprovedAmountInBaseCurrency || ClaimAmountInBaseCurrency || 0);
      });
    });

    let totalExpense = 0.00;
    let amountPayable = 0.00;

    summary.items?.forEach((item: any) => {
      const value = Number(item.value);
      if (TOTAL_EXPENSE_KEYS.includes(item.paymentModeId)) totalExpense += value;
      if (PAYABLE_KEYS.includes(item.paymentModeId)) amountPayable += value;
      item.value = value.toFixed(2);
    });

    summary.items?.forEach((item: any) => {
      if (item.name === 'totalExpense') item.value = totalExpense.toFixed(2);
      if (item.name === 'amountPayable') item.value = amountPayable.toFixed(2);
    });
  }

  private prepareGstAndApprovalDetails() {
    this.expenseRequestPreviewData?.dynamicExpenseDetailModels?.forEach((details: any) => {
      details?.data?.forEach((expense: any) => {
        if (expense?.ClaimStatusId !== 5) {
          if (expense?.gst?.length > 0) {
            expense.gst.forEach((gst: any) => {
              this.expenseRequestGstType.push({
                ...gst,
                ExpenseRequestGstTypeId: gst.ExpenseRequestGstId
              });
            });
          }

          let statusId = expense?.statusId || 0;
          if (['approval', 'finance-approval'].includes(this.mode)) {
            statusId = expense?.selected ? 6 : 5;
          }

          this.expenseRequestApprovalDetailType.push({
            ExpenseRequestDetailId: expense?.ExpenseRequestDetailId || 0,
            ApprovedAmount: expense?.ApprovedAmount || 0,
            ApproverId: Number(localStorage.getItem('userMasterId')),
            ApproverRemarks: expense?.remarks || "",
            ActionStatusId: statusId
          });
        }
      });
    });
  }

  prepareAdjustmentFormPayload() {

    this.dynamicAdjustmentFormpayload = {};

    const adjustmentSection = this.otherDetails?.find((details: any) => details?.name === 'Adjustment');

    if (adjustmentSection?.formControls?.length) {
      adjustmentSection.formControls.forEach((control: any) => {
        const formValue = this.createDynamicFormComponent?.form?.get(control.name)?.value;
        const configValue = control.value ?? null;

        this.dynamicAdjustmentFormpayload[control.name] = formValue ?? configValue;
      });
    }
  }

  onAction(buttonData: any) {

    const allSelectedData = this.materialTableComponents.map(table => table.getSelectedData());

    const invalidItemFound = allSelectedData.some((data: any) => {
      return data?.data?.some((item: any) => {
        if (item?.selected === false && item?.remarks === '' && item.ClaimStatusId !== 5) {
          this.snackbarService.error('Please provide justification reamrk for unselected items.');
          return true; // Stop inner loop
        }
        return false;
      });
    });

    if (invalidItemFound) {
      return; // Stop further execution
    }

    allSelectedData.forEach((data: any) => {
      if (data?.data?.length > 0) {
        this.getSelection(data);
      }
    });

    if (buttonData?.type == 'approve') {
      this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.setValidators(null);
      this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.updateValueAndValidity();
    } else {
      this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.setValidators([
        Validators.required,
        Validators.maxLength(this.expenseRequestPreviewConfig.justification.maxLength || 500)
      ]);
      this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.updateValueAndValidity();
    }

    if (this.justificationForm.invalid) {
      this.justificationForm.markAllAsTouched();
      return;
    }
    if (this.mode == 'approval') {

      const approvalPayload = {
        ExpenseRequestId: this.expenseRequestPreviewData?.expenseRequestId || 0,
        Remarks: this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.value,
        ApprovalAction: buttonData.type == 'approve' ? 113 : (buttonData.type == 'seekClarification' ? 114 : 115),
        ExpenseRequestApprovalDetailType: this.expenseRequestApprovalDetailType,
        ExpenseRequestGstType: [],
        ActionBy: Number(localStorage.getItem('userMasterId'))
      }
      console.log(approvalPayload)
      this.confirmDialogService
        .confirm({
          title: '',
          message: buttonData.confirmPopup.message,
          confirmText: buttonData.confirmPopup.confirmText,
          cancelText: buttonData.confirmPopup.cancelText
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.expenseService.expenseExpenseRequestApprovals(approvalPayload).pipe(take(1)).subscribe({
              next: (res: any) => {
                this.snackbarService.success(buttonData.Success);
                this.router.navigate(['/expense/expense/dashboard']);
              },
              error: (err) => {
                console.error(err);
                this.snackbarService.error('Something went wrong with the API.');
              }
            });
          }
        });

    }
    if (this.mode == 'finance-approval') {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      if (this.billableControl.invalid) {
        this.billableControl.markAsTouched();
        return;
      }

      if (this.createDynamicFormComponent?.form.invalid) {
        this.createDynamicFormComponent.form.markAllAsTouched();
        console.log(this.createDynamicFormComponent.form);
      }

      this.prepareAdjustmentFormPayload();

      if (Object.keys(this.dynamicAdjustmentFormpayload).length > 0) {
        const adjustmentData = this.dynamicAdjustmentFormpayload;
        const adjustmentAmount = Number(adjustmentData?.AdjustmentAmount) || 0;
        if ((adjustmentAmount > 0 || adjustmentAmount < 0) && adjustmentData?.AdjustmentRemarks === '') {
          this.snackbarService.error('Please provide adjustment remarks for the entered amount.');
          return;
        }
      }

      const financePayload = {
        ExpenseRequestId: this.expenseRequestPreviewData?.expenseRequestId || 0,
        Remarks: this.justificationForm.get(this.expenseRequestPreviewConfig.justification.controlName)?.value,
        ApprovalAction: buttonData.type == 'approve' ? 113 : (buttonData.type == 'seekClarification' ? 114 : 115),
        ExpenseRequestApprovalDetailType: this.expenseRequestApprovalDetailType,
        ExpenseRequestGstType: this.expenseRequestGstType,
        ActionBy: Number(localStorage.getItem('userMasterId')),
        ...this.dynamicAdjustmentFormpayload
      }
      console.log(financePayload)
      this.confirmDialogService
        .confirm({
          title: '',
          message: buttonData.confirmPopup.message,
          confirmText: buttonData.confirmPopup.confirmText,
          cancelText: buttonData.confirmPopup.cancelText
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.financeService.financeExpenseRequestFinanceApproval(financePayload).pipe(take(1)).subscribe({
              next: (res: any) => {
                this.snackbarService.success(buttonData.Success);
                this.router.navigate(['/expense/expense/dashboard']);
              },
              error: (err) => {
                console.error(err);
                this.snackbarService.error('Something went wrong with the API.');
              }
            });
          }
        });
    }
  }

  onTabChange(eventOrIndex?: MatTabChangeEvent | number) {

    const tabIndex = typeof eventOrIndex === 'number'
      ? eventOrIndex
      : eventOrIndex?.index ?? 0;

    const tabLabel = this.otherDetails[tabIndex]?.name;
    if (tabLabel == 'Adjustment') {

      this.isCreateAdjustmentform = true;
      // Bind values from review data to formControls
      const adjustmentSection = this.otherDetails?.find((details: any) => details?.name === 'Adjustment');
      if (adjustmentSection && adjustmentSection.formControls) {
        // Get adjustment data (array or object)
        let adjustmentData: any = null;
        const adj = this.expenseRequestPreviewData?.expenseRequestAdjustment;
        if (Array.isArray(adj) && adj.length > 0) {
          adjustmentData = adj[0];
        } else if (adj && typeof adj === 'object') {
          adjustmentData = adj;
        }
        if (adjustmentData) {
          adjustmentSection.formControls.forEach((control: any) => {
            // Map by control.name to adjustmentData property
            if (adjustmentData.hasOwnProperty(control.propertyName)) {
              control.value = adjustmentData[control.propertyName];
            }
          });
        }
      }
    } else {
      this.isCreateAdjustmentform = false;
    }
    this.cdr.detectChanges(); // Ensure the view updates after changing isCreateAdjustmentform    
  }

  goBack() {
    if (this.mode == 'preview') {
      this.router.navigate(['/expense/expense/dashboard']);
    }
    if (this.mode == 'approval') {
      this.router.navigate(['/expense/expense/approval']);
    }
    if (this.mode == 'finance-approval') {
      this.router.navigate(['/expense/expense/finance']);
    }
  }

  showRemarks(row: any) {

    const id = row?.ExpenseRequestDetailId ?? row?.slNo ?? 0; // fallback to slNo or 0 if no id
    let remarksData: any = [];
    if (this.expenseRequestPreviewData?.expenseRequestApprovalDetails) {
      this.expenseRequestPreviewData.expenseRequestApprovalDetails.forEach((approvalDetail: any) => {
        if (approvalDetail?.expenseRequestDetailId == id) {
          remarksData.push(approvalDetail);
        }
      });
    }
    // Always open the modal, even if remarksData is empty
    if (window.innerWidth <= 768) {
      this.bottomSheet.open(RemarksModalComponent, {
        data: { remarksData },
        panelClass: 'custom-modal-panel'
      });
    } else {
      this.dialog.open(RemarksModalComponent, {
        width: '1000px',
        data: { remarksData },
        panelClass: 'custom-modal-panel'
      });
    }
  }

  /**
    * Opens the expense summary sidebar in a bottom sheet on mobile devices.
    * @param templateRef Reference to the ng-template containing the sidebar content.
    */
  openExpenseSummarySheet(templateRef: TemplateRef<any>) {
    if (window.innerWidth <= 768) {
      this.bottomSheet.open(templateRef, {
        panelClass: 'expense-bottom-sheet'
      });
    }
  }

  // For mobile: close the expense summary sheet
  closeExpenseSummarySheet() {
    this.bottomSheet.dismiss();
  }

  getFormData(event: any) {
    const adjustmentAmount = Number(event?.get('AdjustmentAmount')?.value) || 0;
    this.setAdjustmentAmount(adjustmentAmount);
  }

  setAdjustmentAmount(adjustmentAmount: number) {
    const EXPENSE_SUMMARY_ID = "expense-summary";
    const summary = this.expenseSummary?.find((s: any) => s.id === EXPENSE_SUMMARY_ID);
    if (!summary) return;

    const getValue = (name: string): number => {
      const item = summary.items?.find((i: any) => i.name === name && [92,93].includes(i.paymentModeId));
      return item ? parseFloat(item.value) || 0 : 0;
    };

    const setValue = (name: string, value: number) => {
      const item = summary.items?.find((i: any) => i.name === name);
      if (item) {
        item.value = value.toFixed(2);
      }
    };

    // Update adjustments
    setValue('adjustments', adjustmentAmount);

    // Get required values
    const totalExpense = getValue('totalExpense');
    const lessAdvance = getValue('lessAdvance');
    const adjustments = adjustmentAmount;

    // Calculate and update amount payable
    const amountPayable = totalExpense - lessAdvance + adjustments;
    setValue('amountPayable', amountPayable);
  }

}
