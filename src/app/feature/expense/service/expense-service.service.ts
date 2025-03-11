import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private baseUrl = environment.apiUrl;
  private apiTravelRequestsPendingForClaimUrl = `${this.baseUrl}/Expense/GetTravelRequestsPendingForClaim?UserMasterId=4&TravelTypeId=0`;
  private apiTravelRequestJsonInfo = `${this.baseUrl}/Expense/GetTravelRequestJsonInfo`;

  private apiTravelDDLData = `${this.baseUrl}/Expense/GetTravelDDLData`;
  private apiCityAuto = `${this.baseUrl}/Master/GetCityAuto`;

  private apiExpensePolicyEntitlement = `${this.baseUrl}/Expense/GetExpensePolicyEntitlement
`


  constructor(
    private http: HttpClient
  ) { }

  // Pending travel requests for claim
  getPendingTravelRequests(): Observable<any> {
    return this.http.get<any>(this.apiTravelRequestsPendingForClaimUrl);
  }

  // Travel Request Json Info
  getTravelRequestJsonInfo(travelRequestId: number): Observable<any> {
    const requestBody = {
      travelRequestId: travelRequestId
    };
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiTravelRequestJsonInfo, requestBody);
  }

  // Travel Mode List
  getTravelModeList(): Observable<any> {
    let ddlType = 'TravelMode';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Travel Class List
  getTravelClassList(refId: number): Observable<any> {
    let ddlType = 'TravelClass';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}&RefId=${refId}`);
  }

  // City Auto
  getCityAuto(term: string) {
    return this.http.get<any>(`${this.apiCityAuto}?term=${term}&typeid=53`);
  }

  // Payment Type List
  getTravelPaymentType() {
    let ddlType = 'PayType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Expense Policy Entitlement
  getExpensePolicyEntitlement() {
    const requestBody = {
      ClaimTypeId: 53,
      UserMasterId: 4,
      ExpenseCategoryId: 3,
      ReferenceDate: '06-Mar-2024',
      CityGradeId: 8,
      CountryGradeId: 0,
      PolicyReferenceId: 53,
      TravelRequestId: 37
    };
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiExpensePolicyEntitlement, requestBody);
  }


}
