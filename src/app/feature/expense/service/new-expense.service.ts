import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewExpenseService {
  basePath = "https://localhost:7073/api/Expense/"

  constructor(
    private httpClient: HttpClient
  ) { }

  expenseRequestCreatePost(request: any) {
    return this.httpClient.post<any>(`${this.basePath}ExpensesRequestCreate`, request);
  }
  
}
