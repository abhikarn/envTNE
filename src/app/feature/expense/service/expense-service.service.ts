import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/Expense/GetTravelRequestsPendingForClaim?UserMasterId=4&TravelTypeId=0&_=1739778373970`;  // API URL

  constructor(
    private http: HttpClient
  ) { }

  // Method to get pending travel requests for claim
  getPendingTravelRequests(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
