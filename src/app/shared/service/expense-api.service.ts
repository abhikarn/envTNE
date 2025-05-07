
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly newBaseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // -------------------- Account Controller --------------------
  authenticateEmployee(payload: any): Observable<any> {
    return this.http.post(`${this.newBaseUrl}/Account/EmployeeAuth`, payload);
  }

  getUserData(sessionId: string): Observable<any> {
    return this.http.post(`${this.newBaseUrl}/Account/GetUserData`, { sessionId });
  }

  // -------------------- Expense Controller --------------------
  getExpenseDetails(expenseRequestId: number): Observable<any> {
    return this.http.get(`${this.newBaseUrl}/Expense/GetExpenseDetails/${expenseRequestId}`);
  }

  submitExpense(payload: any): Observable<any> {
    return this.http.post(`${this.newBaseUrl}/Expense/SubmitExpense`, payload);
  }

  getExpensePreviewDetails(payload: any): Observable<any> {
    return this.http.post(`${this.newBaseUrl}/Expense/GetExpensesRequestDetailPreviewGet`, payload);
  }

}
