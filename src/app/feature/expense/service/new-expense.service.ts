import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewExpenseService {
  basePath = `${environment.newApiUrl}`
  assetPath = `${environment.assetsPath}`
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

  EmployeeAuth(request: any) {

    return this.httpClient.post<any>(`${this.basePath}Account/EmployeeAuth`, request);
  }

  GetUserData(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Account/GetUserData`, request);
  }

  OCRValidateCheck(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Expense/OCRValidateCheck`, request);
  }

  getExpenseConfig() {
    return this.httpClient.get<any>(`${this.assetPath}/assets/config/expense-config.json`);
  }

  getloginConfig() {
    return this.httpClient.get<any>(`${this.assetPath}/assets/config/login-config.json`);
  }


  documentDownload(data: any): Observable<Blob> {
    return this.httpClient.post(`${this.basePath}Expense/Download`, data, {
      responseType: 'blob'
    });
  }

  getTravelRequestBookedDetail(request: any) {
    return this.httpClient.post<any>(`${this.basePath}Travel/TravelRequestBookedDetailGet`, request);
  }

}
