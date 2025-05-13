import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class NewExpenseService {
  basePath = `${environment.newApiUrl}`
  newbasePath = `${environment.apiUrl}`

  constructor(
    private httpClient: HttpClient
  ) { }

  expenseRequestCreatePost(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Expense/ExpensesRequestCreate`, request);
  }
  
  getExpenseRequest(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Expense/ExpensesRequestGet`, request);
  }

  getMasterNameById(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Expense/GetMasterNameById`, request);
  }

  getExpenseRequestDetailPreview(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Expense/GetExpensesRequestDetailPreviewGet`, request);
  }

  getRequestorInfo(request: any) {
    return this.httpClient.post<any>(`${this.newbasePath}User/EmployeeProfile`, request);
  }

  getExpenseConfig() {
    return this.httpClient.get<any>('/assets/config/expense-config.json');
  }
}
