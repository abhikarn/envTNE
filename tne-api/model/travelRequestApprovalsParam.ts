/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { TravelApprovalServiceType } from './travelApprovalServiceType';


export interface TravelRequestApprovalsParam { 
    TravelRequestId?: number;
    Remarks?: string;
    ApprovalAction?: number;
    TravelApprovalServiceType?: Array<TravelApprovalServiceType>;
    IsActive?: boolean;
    Status?: string;
    ActionBy?: number;
    TransactionId?: string;
    CommunicationSeenCount?: number;
}

