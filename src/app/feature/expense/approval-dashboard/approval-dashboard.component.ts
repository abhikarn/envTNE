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

  displayedColumns: ColumnConfig[] =  [];

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    this.loadDisplayedColumns();
    this.getMyExpenseRequestDashBoard();
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
      console.log(this.dataSource.data);
    })
  }

loadDisplayedColumns(): void {     
    this.http.get(`assets/config/expense-config.json`).subscribe((config: any) => {
      this.expenseDashboardConfig = config;
      const tableDetail = config.dashboard?.expenseStatement.tableDetail || [];
      this.displayedColumns = tableDetail.map((col: any) => ({
        key: col.key,
        label: col.label,
        sortable: col.sortable,
      }));
      this.columnKeys = this.displayedColumns.map(col => col.key);
      this.filterColumnKeys = this.displayedColumns.map(col => col.key + '_filter');
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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
}



