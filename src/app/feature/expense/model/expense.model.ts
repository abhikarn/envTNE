export interface ExpenseRequest {
    ExpenseRequestId: number;
    RequestForId: number;
    RequesterId: number;
    TravelRequestId: number;
    RequestDate: string;
    Purpose: string;
    CostCentreId: number;
    BillableCostCentreId: number;
    Remarks: string;
    IsDraft: boolean;
    ExpenseRequestDetailType: ExpenseRequestDetail[];
    ExpenseRequestMetaDataType: ExpenseRequestMetaData[];
    ExpenseRequestDetailMetaDataType: ExpenseRequestDetailMetaData[];
    ExpenseRequestGstType: ExpenseRequestGst[];
    RelocationExpenseOtherVendorQuoteDetailsType: RelocationExpenseVendor[];
    DocumentType: DocumentType[];
    ActionBy: number;
  }
  
  export interface ExpenseRequestDetail {
    ExpenseRequestDetailId: number;
    ExpenseRequestId: number;
    ExpenseCategoryId: number;
    CityId: number;
    CityGradeId: number;
    CountryId: number;
    CountryGradeId: number;
    ClaimDate: string;
    PaymentModeId: number;
    ClaimAmount: number;
    CurrencyId: number;
    ConversionRate: number;
    ClaimAmountInBaseCurrency: number;
    IsEntitlementActuals: boolean;
    EntitlementAmount: number;
    EntitlementCurrencyId: number;
    EntitlementConversionRate: number;
    ApprovedAmount: number;
    ClaimStatusId: number;
    IsViolation: boolean;
    IsOCRRestrictedKeyword: boolean;
    Violation: string;
    TransactionId: string;
    IsTravelRaiseRequest: boolean;
    TaxAmount: string;
  }
  
  export interface ExpenseRequestMetaData {
    ExpenseRequestMetaDataId: number;
    ExpenseRequestMetaId: number;
    ExpenseRequestId: number;
    IntegerValue: number;
    NumericValue: number;
    DatetimeValue: string;
    VarcharValue: string;
    BitValue: boolean;
    UniqueIdentifierValue: string;
    RelatedToId: number;
    TransactionReference: string;
  }
  
  export interface ExpenseRequestDetailMetaData {
    ExpenseRequestMetaDataId: number;
    ExpenseRequestMetaId: number;
    ExpenseRequestDetailId: number;
    IntegerValue: number;
    NumericValue: number;
    DatetimeValue: string;
    VarcharValue: string;
    BitValue: boolean;
    UniqueIdentifierValue: string;
    RelatedToId: number;
    TransactionReference: string;
  }
  
  export interface ExpenseRequestGst {
    ExpenseRequestGstTypeId: number;
    ExpenseRequestDetailId: number;
    GstIn: string;
    VendorName: string;
    InvoiceNumber: string;
    Amount: number;
    Basic: number;
    CGST: number;
    SGST: number;
    IGST: number;
    UGST: number;
    CESS: number;
    Gross: number;
    HSN_SAC_Code: string;
    StateCode: string;
    TaxCode: string;
    CostcenterId: number;
    TransactionReference: string;
  }
  
  export interface RelocationExpenseVendor {
    RelocationExpenseOtherVendorQuoteDetailsTypeId: number;
    ExpenseRequestDetailId: number;
    VendorName: string;
    QuoteNumber: string;
    QuoteDate: string;
    Amount: number;
    TransactionId: string;
    TransactionReference: string;
  }
  
  export interface DocumentType {
    DocumentId: number;
    ReferenceType: number;
    ModuleId: number;
    RequestId: number;
    ReferenceId: number;
    FileName: string;
    Guid: string;
    Location: string;
    Remarks: string;
    Password: string;
    TransactionReference: string;
  }
  