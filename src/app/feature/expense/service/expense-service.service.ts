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
  private apiLocalTravelMode = `${this.baseUrl}/Expense/GetLocalTravelMode`;
  private apiApplicationMsg = `${this.baseUrl}/Message/GetApplicationMessage`;
  private apiGradeData = `${this.baseUrl}/Expense/GetGradeData`;
  private apiExpensePolicyEntitlement = `${this.baseUrl}/Expense/GetExpensePolicyEntitlement`;
  private apiCurrencyRate = `${this.baseUrl}/Master/GetCurrRate`;


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
  getCityAuto(term: string): Observable<any> {
    return this.http.get<any>(`${this.apiCityAuto}?term=${term}&typeid=53`);
  }

  // Payment Type List
  getTravelPaymentType(): Observable<any> {
    let ddlType = 'PayType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Currency List
  getCurrencyList(): Observable<any> {
    let ddlType = 'Currency';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Accomodation Type
  getAccomodationTypeList(): Observable<any> {
    let ddlType = 'AccomodationType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Baggage Type
  getBaggageTypeList(): Observable<any> {
    let ddlType = 'BaggageType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Other Type
  getOtherTypeList(): Observable<any> {
    let ddlType = 'OtherType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}&refId=51`);
  }

  // BoMeals
  getBoMeals(): Observable<any> {
    let ddlType = 'ddlBoMeals';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}&refId=51`);
  }

  // Local travel type
  getLocalTravelTypeList(): Observable<any> {
    let ddlType = 'LocalTravelType';
    return this.http.get<any>(`${this.apiTravelDDLData}?ddlType=${ddlType}`);
  }

  // Local Travel Mode
  getLocalTravelModeList(): Observable<any> {
    return this.http.get<any>(`${this.apiLocalTravelMode}?claimTypeId=51&expenseCategoryId=4&userMasterId=4&travelRequestId=0`);
  }

  // Application Message
  getApplicationMessage(): Observable<any> {
    return this.http.get<any>(`${this.apiApplicationMsg}?applicationMessageByFlagParam=ChooseTravelRequest`);
  }

  // Grade Data
  getGradeData(): Observable<any> {
    return this.http.get<any>(`${this.apiGradeData}?CityId=0&ReferenceDate=25-Mar-2024&Type=53`);
  }

  // Expense Policy Entitlement
  getExpensePolicyEntitlement(): Observable<any> {
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

  // Currency Rate From master
  getCurrencyRate(): Observable<any> {
    return this.http.get<any>(`${this.apiCurrencyRate}?CurrencyId=1&ReferenceDate=25-Mar-2024`);
  }


}
