import { Component, DestroyRef, Directive, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { CityAutocompleteParam, DashboardService, DataService, ExpenseRequestModel, ExpenseService, TravelService, ExpenseRequestDashboardParam } from '../../../../../tne-api';
import { forkJoin, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { environment } from '../../../../environment';

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
}

export const ELEMENT_DATA: any[] = [];

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
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
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  // encapsulation:viewChild,
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent implements OnInit {
  expenseDashboardConfig: any;
  expenseDashboardParam: ExpenseRequestDashboardParam = {}
  expenseRequesData: any[] = []
  statusWiseExpenseDataCount: any;
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

  columnFilterValues: { [key: string]: string } = {}; // Track filter values per column

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
    // this.mobileDisplayData = [];
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

  // loadDisplayedColumns(): void {     
  //   this.http.get(`assets/config/expense-config.json`).subscribe((config: any) => {
  //     this.expenseDashboardConfig = config;
  //     const tableDetail = config.dashboard?.expenseStatement.tableDetail || [];
  //     this.displayedColumns = tableDetail.map((col: any) => ({
  //       key: col.key,
  //       label: col.label,
  //       sortable: col.sortable,
  //       order: col.order        
  //     }));
  //     this.columnKeys = this.displayedColumns.map(col => col.key);
  //     this.filterColumnKeys = this.displayedColumns.map(col => col.key + '_filter');
  //   });
  // }

  loadDisplayedColumns(): void {
    this.http.get(`assets/config/expense-config.json`).subscribe((config: any) => {
      this.expenseDashboardConfig = config;
      const tableDetail = config.dashboard?.expenseStatement.tableDetail || [];

      this.displayedColumns = tableDetail.map((col: any) => {
        // Normalize 'are order' to 'order' if present
        // const orderValue = col['order'] ?? col['are order'] ?? null;

        return {
          key: col.key,
          label: col.label,
          sortable: col.sortable,
          order: col.order ? col.order : 0
        };
      }).sort((a: any, b: any) => a.order - b.order);

      this.columnKeys = this.displayedColumns.map(col => col.key);
      this.filterColumnKeys = this.displayedColumns.map(col => col.key + '_filter');
    });
  }

  columnKeys: string[] = [];
  filterColumnKeys: string[] = [];

  getMyExpenseRequestDashBoard() {
    let payloadData = this.expenseDashboardParam = {
      UserMasterId: this.authService.getUserMasterId(),
      ActionBy: this.authService.getUserMasterId(),
    }
    this.dashboardService.dashboardGetExpenseRequestDashboard(payloadData).subscribe(data => {
      let requestData = data;
      this.expenseRequesData = requestData.ResponseValue as any[];
      this.generateStatusWiseCount();
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
    // Use filtered data for mobile
    this.mobileDisplayData = this.dataSourceMobile.filteredData.slice(0, end);
  }

  onLoadMore() {

    this.mobileCurrentPage++;
    this.updateMobileDisplayData();
  }

  applyFilter(event: Event, column: string) {
    ;
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.columnFilterValues[column] = filterValue;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filters = JSON.parse(filter);
      return Object.keys(filters).every(col =>
        (data[col] ?? '').toString().toLowerCase().includes(filters[col])
      );
    };
    this.dataSource.filter = JSON.stringify(this.columnFilterValues);

    // For mobile
    this.dataSourceMobile.filterPredicate = this.dataSource.filterPredicate;
    this.dataSourceMobile.filter = JSON.stringify(this.columnFilterValues);

    if (this.isMobile) {
      this.mobileCurrentPage = 1;
      this.updateMobileDisplayData();
    }
  }

  applyGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Clear column filters when global filter is used
    this.columnFilterValues = {};

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return Object.values(data).some(value =>
        String(value).toLowerCase().includes(filter)
      );
    };
    this.dataSource.filter = filterValue;

    this.dataSourceMobile.filterPredicate = this.dataSource.filterPredicate;
    this.dataSourceMobile.filter = filterValue;

    if (this.isMobile) {
      this.mobileCurrentPage = 1;
      this.updateMobileDisplayData();
    }
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

  generateStatusWiseCount(): void {
    this.statusWiseExpenseDataCount = [];
    this.statusWiseExpenseDataCount = this.expenseDashboardConfig?.dashboard?.statusWiseExpenseRequest?.statusWise.filter((x: any) => x.displayStatus === true) || [];
    this.statusWiseExpenseDataCount.forEach((item: any, index: any) => {
      const count = this.expenseRequesData.filter(x => item.statusIds.includes(x.ClaimStatusId)).length;
      this.statusWiseExpenseDataCount[index].count = count;
      item.count = count; // Optional: update JSON as well
    });
  }
}