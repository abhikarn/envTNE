/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ExpenseRequestApprovalDetailType } from './expenseRequestApprovalDetailType';
import { ExpenseRequestGstType } from './expenseRequestGstType';


export interface ExpenseActionParam { 
    ExpenseRequestId?: number;
    Remarks?: string;
    AdjustmentRemarks?: string;
    ApprovalAction?: number;
    AdjustmentAmount?: number;
    AdjustmentCurrencyId?: number;
    ExpenseRequestApprovalDetailType?: Array<ExpenseRequestApprovalDetailType>;
    ExpenseRequestGstType?: Array<ExpenseRequestGstType>;
    IsActive?: boolean;
    Status?: string;
    ActionBy?: number;
    TransactionId?: string;
    CommunicationSeenCount?: number;
}

