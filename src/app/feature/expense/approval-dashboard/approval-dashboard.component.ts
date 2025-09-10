import { Component, DestroyRef, Directive, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DashboardService, DataService, ExpenseRequestModel, ExpenseService, TravelService, ExpenseRequestDashboardParam } from '../../../../../tne-api';
import { forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../../shared/dynamic-form/form-control.interface';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackbarService } from '../../../shared/service/snackbar.service';
import { ConfirmDialogService } from '../../../shared/service/confirm-dialog.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DateExtensionComponent } from '../date-extension/date-extension.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewExpenseService } from '../service/new-expense.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { AuthService } from '../../../shared/service/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BulkApproveModalComponent } from '../../../shared/component/bulk-approve-modal/bulk-approve-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OneClickApproveComponent } from '../../../shared/component/one-click-approve/one-click-approve.component';

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  showSearch: boolean;
}

export const ELEMENT_DATA: any[] = [];

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './approval-dashboard.component.html',
  styleUrl: './approval-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ApprovalDashboardComponent implements OnInit {
  expenseDashboardConfig: any;
  expenseDashboardParam: ExpenseRequestDashboardParam = {}
  expenseRequesData: any[] = []
  statusWiseExpenseDataCount: { approved: number; pending: number; rejected: number } = {
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  displayedColumns: ColumnConfig[] = [];

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  dataSourceMobile = new MatTableDataSource(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isMobile: boolean = false;
  mobilePageSize: number = 5;
  mobileCurrentPage: number = 1;
  mobileDisplayData: any[] = [];

  lastPageSize: number = 5;
  lastPageIndex: number = 0;
  selectAll: boolean = false;

  constructor(
    private expenseService: ExpenseService,
    private dashboardService: DashboardService,
    private dataService: DataService,
    private travelService: TravelService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {

  }
  ngOnInit(): void {
    this.dataSource.data = [];
    this.dataSourceMobile.data = [];
    this.loadDisplayedColumns();
    this.getMyExpenseRequestDashBoard();
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
  }

  ngAfterViewInit(): void {
    if (!this.isMobile) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Restore paginator state if available
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.pageSize = this.lastPageSize;
          this.paginator.pageIndex = this.lastPageIndex;
        }
      });
      // Listen to paginator changes
      this.paginator.page.subscribe((event) => {
        this.lastPageSize = event.pageSize;
        this.lastPageIndex = event.pageIndex;
      });
    }
  }


  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreen.bind(this));
  }

  checkScreen() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      // Save paginator state before switching to mobile
      if (this.paginator) {
        this.lastPageSize = this.paginator.pageSize;
        this.lastPageIndex = this.paginator.pageIndex;
      }
      this.mobileCurrentPage = 1;
      this.updateMobileDisplayData();
    } else if (wasMobile && this.paginator) {
      // Restore paginator state when switching back to desktop
      setTimeout(() => {
        this.paginator.pageSize = this.lastPageSize;
        this.paginator.pageIndex = this.lastPageIndex;
        this.paginator._changePageSize(this.lastPageSize);
      });
    }
  }

  columnKeys: string[] = this.displayedColumns.map(col => col.key);
  filterColumnKeys: string[] = this.displayedColumns.map(col => col.key + '_filter');

  getMyExpenseRequestDashBoard() {
    let payloadData = this.expenseDashboardParam = {
      UserMasterId: this.authService.getUserMasterId(),
      ActionBy: this.authService.getUserMasterId(),
    }
    this.dashboardService.dashboardGetExpenseRequestApprovalDashboard(payloadData).subscribe(data => {

      let requestData = data;
      this.expenseRequesData = requestData.ResponseValue as any[];
      this.statusWiseExpenseDataCount = {
        approved: this.expenseRequesData.filter(x => x.ClaimStatusId == 23).length,
        pending: this.expenseRequesData.filter(x => x.ClaimStatusId == 27 || x.ClaimStatusId === 31).length,
        rejected: this.expenseRequesData.filter(x => x.ClaimStatusId == 30).length,
      };
      this.dataSource.data = requestData.ResponseValue as any[];
      this.dataSourceMobile.data = requestData.ResponseValue as any[];
      if (this.isMobile) {
        this.mobileCurrentPage = 1;
        this.updateMobileDisplayData();
      }
    })
  }

  updateMobileDisplayData() {
    const start = 0;
    const end = this.mobileCurrentPage * this.mobilePageSize;
    this.mobileDisplayData = this.dataSourceMobile.data.slice(0, end);
  }

  onLoadMore() {
    
    this.mobileCurrentPage++;
    this.updateMobileDisplayData();
  }

  loadDisplayedColumns(): void {
    this.http.get(`assets/config/expense-config.json`).subscribe((config: any) => {
      this.expenseDashboardConfig = config;
      const tableDetail = config.dashboard?.expenseStatement.approverTableDetail || [];
      this.displayedColumns = tableDetail.map((col: any) => ({
        key: col.key,
        label: col.label,
        sortable: col.sortable,
        showSearch: col.showSearch
      }));
      this.columnKeys = this.displayedColumns.map(col => col.key);
      this.filterColumnKeys = this.displayedColumns.map(col => col.key + '_filter');
    });
  }

  // ngAfterViewInit(): void {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (data[column] ?? '').toString().toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
  }

  applyGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return Object.values(data).some(value =>
        String(value).toLowerCase().includes(filter)
      );
    };
  }

  exportExcel(): void {
    const exportData = this.dataSource.filteredData.map((row: any, index: number) => {
      const rowData: any = {};
      this.displayedColumns.forEach(col => {
        if (col.key === 'slNo') {
          rowData[col.label] = index + 1;
        } else if (col.key === 'PolicyViolationCount') {
          rowData[col.label] = row[col.key] > 0 ? 'Violation' : 'No Violation';
        } else if (col.key === 'RequestDate') {
          rowData[col.label] = new Date(row[col.key]).toLocaleDateString('en-GB');
        } else if (col.key === 'action') {
          rowData[col.label] = '';
        } else {
          rowData[col.label] = row[col.key];
        }
      });
      return rowData;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'ExpenseRequestData.xlsx');
  }

  toggleSelectAll(checked: boolean): void {
      if (this.dataSource && this.dataSource.data) {
        this.dataSource.data.forEach((element: any) => {
          element.selected = checked;
        });
      }
      if (this.mobileDisplayData) {
        this.mobileDisplayData.forEach((element: any) => {
          element.selected = checked;
        });
      }
    }
    
    // bulk approve
    bulkApprove(): void {
      const selectedRequests = this.dataSource.data.filter((item: any) => item.selected);
      if (selectedRequests.length === 0) {
        this.snackbarService.error('No requests selected for approval', 3000);
        return;
      }
  
      this.dialog.open(BulkApproveModalComponent, {
        width: '1000px',
        data: { selectedRequests },
        panelClass: 'custom-modal-panel'
      });
    }

    oneClickApprove(id: number) {
      const selectedRequest = this.dataSource.data.filter((item: any) => item.ExpenseRequestId == id);
      if (selectedRequest.length === 0) {
        this.snackbarService.error('Something went wrong, Please try again!', 3000);
        return;
      }

       this.dialog.open(OneClickApproveComponent, {
        width: '1000px',
        data: { selectedRequest },
        panelClass: 'custom-modal-panel'
      });
    }
}