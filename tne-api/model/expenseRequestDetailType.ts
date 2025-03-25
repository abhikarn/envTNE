/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface ExpenseRequestDetailType { 
    ExpenseRequestDetailId?: number;
    ExpenseRequestId?: number;
    ExpenseCategoryId?: number;
    CityId?: number;
    CityGradeId?: number;
    CountryId?: number;
    CountryGradeId?: number;
    ClaimDate?: string;
    PaymentModeId?: number;
    ClaimAmount?: number;
    CurrencyId?: number;
    ConversionRate?: number;
    ClaimAmountInBaseCurrency?: number;
    IsEntitlementActuals?: boolean;
    EntitlementAmount?: number;
    EntitlementCurrencyId?: number;
    EntitlementConversionRate?: number;
    ApprovedAmount?: number;
    ClaimStatusId?: number;
    IsViolation?: boolean;
    Violation?: string;
    TransactionId?: string;
    IsTravelRaiseRequest?: boolean;
    TaxAmount?: string;
}

