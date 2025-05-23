/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext 
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { DataSubmit } from '../model/dataSubmit';
// @ts-ignore
import { ExpenseRequestApprovalsDashboardParam } from '../model/expenseRequestApprovalsDashboardParam';
// @ts-ignore
import { ExpenseRequestDashboardParam } from '../model/expenseRequestDashboardParam';
// @ts-ignore
import { MobileAppDashboardDataParam } from '../model/mobileAppDashboardDataParam';
// @ts-ignore
import { TravelRequestApprovalsDashboardParam } from '../model/travelRequestApprovalsDashboardParam';
// @ts-ignore
import { TravelRequestDashboardParam } from '../model/travelRequestDashboardParam';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';
import { BaseService } from '../api.base.service';



@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {

    constructor(protected httpClient: HttpClient, @Optional() @Inject(BASE_PATH) basePath: string|string[], @Optional() configuration?: Configuration) {
        super(basePath, configuration);
    }

    /**
     * @param mobileAppDashboardDataParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetDashboardEmployeeLanding(mobileAppDashboardDataParam: MobileAppDashboardDataParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetDashboardEmployeeLanding(mobileAppDashboardDataParam: MobileAppDashboardDataParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetDashboardEmployeeLanding(mobileAppDashboardDataParam: MobileAppDashboardDataParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetDashboardEmployeeLanding(mobileAppDashboardDataParam: MobileAppDashboardDataParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (mobileAppDashboardDataParam === null || mobileAppDashboardDataParam === undefined) {
            throw new Error('Required parameter mobileAppDashboardDataParam was null or undefined when calling dashboardGetDashboardEmployeeLanding.');
        }

        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/EmployeeLanding`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: mobileAppDashboardDataParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param expenseRequestApprovalsDashboardParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetExpenseRequestApprovalDashboard(expenseRequestApprovalsDashboardParam: ExpenseRequestApprovalsDashboardParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetExpenseRequestApprovalDashboard(expenseRequestApprovalsDashboardParam: ExpenseRequestApprovalsDashboardParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetExpenseRequestApprovalDashboard(expenseRequestApprovalsDashboardParam: ExpenseRequestApprovalsDashboardParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetExpenseRequestApprovalDashboard(expenseRequestApprovalsDashboardParam: ExpenseRequestApprovalsDashboardParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (expenseRequestApprovalsDashboardParam === null || expenseRequestApprovalsDashboardParam === undefined) {
            throw new Error('Required parameter expenseRequestApprovalsDashboardParam was null or undefined when calling dashboardGetExpenseRequestApprovalDashboard.');
        }

        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/ApprovalsExpenseRequest`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: expenseRequestApprovalsDashboardParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param expenseRequestDashboardParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetExpenseRequestDashboard(expenseRequestDashboardParam: ExpenseRequestDashboardParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetExpenseRequestDashboard(expenseRequestDashboardParam: ExpenseRequestDashboardParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetExpenseRequestDashboard(expenseRequestDashboardParam: ExpenseRequestDashboardParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetExpenseRequestDashboard(expenseRequestDashboardParam: ExpenseRequestDashboardParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (expenseRequestDashboardParam === null || expenseRequestDashboardParam === undefined) {
            throw new Error('Required parameter expenseRequestDashboardParam was null or undefined when calling dashboardGetExpenseRequestDashboard.');
        }
        
        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/MyExpenseRequest`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: expenseRequestDashboardParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param travelRequestApprovalsDashboardParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetTravelRequestApprovalsDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetTravelRequestApprovalsDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetTravelRequestApprovalsDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetTravelRequestApprovalsDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (travelRequestApprovalsDashboardParam === null || travelRequestApprovalsDashboardParam === undefined) {
            throw new Error('Required parameter travelRequestApprovalsDashboardParam was null or undefined when calling dashboardGetTravelRequestApprovalsDashboard.');
        }

        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/ApprovalsTravelRequest`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: travelRequestApprovalsDashboardParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param travelRequestApprovalsDashboardParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetTravelRequestBudgetSegregationDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetTravelRequestBudgetSegregationDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetTravelRequestBudgetSegregationDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetTravelRequestBudgetSegregationDashboard(travelRequestApprovalsDashboardParam: TravelRequestApprovalsDashboardParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (travelRequestApprovalsDashboardParam === null || travelRequestApprovalsDashboardParam === undefined) {
            throw new Error('Required parameter travelRequestApprovalsDashboardParam was null or undefined when calling dashboardGetTravelRequestBudgetSegregationDashboard.');
        }

        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/GetTravelRequestBudgetSegregationDashboard`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: travelRequestApprovalsDashboardParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param travelRequestDashboardParam 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public dashboardGetTravelRequestDashboard(travelRequestDashboardParam: TravelRequestDashboardParam, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<DataSubmit>;
    public dashboardGetTravelRequestDashboard(travelRequestDashboardParam: TravelRequestDashboardParam, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<DataSubmit>>;
    public dashboardGetTravelRequestDashboard(travelRequestDashboardParam: TravelRequestDashboardParam, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<DataSubmit>>;
    public dashboardGetTravelRequestDashboard(travelRequestDashboardParam: TravelRequestDashboardParam, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'text/json' | 'application/xml' | 'text/xml', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (travelRequestDashboardParam === null || travelRequestDashboardParam === undefined) {
            throw new Error('Required parameter travelRequestDashboardParam was null or undefined when calling dashboardGetTravelRequestDashboard.');
        }

        let localVarHeaders = this.defaultHeaders;

        const localVarHttpHeaderAcceptSelected: string | undefined = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json',
            'text/json',
            'application/xml',
            'text/xml'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        const localVarHttpContext: HttpContext = options?.context ?? new HttpContext();

        const localVarTransferCache: boolean = options?.transferCache ?? true;


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/xml',
            'text/xml',
            'application/x-www-form-urlencoded'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/Dashboard/MyTravelRequest`;
        return this.httpClient.request<DataSubmit>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: travelRequestDashboardParam,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

}
