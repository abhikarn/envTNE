/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { FilterType } from './filterType';


export interface InternationalBaggageOutfitPolicyParam { 
    UserMasterId?: number;
    ReferenceDate?: string;
    TravelRequestId?: number;
    ExpenseRequestId?: number;
    ClaimAmount?: number;
    ConstraintIdList?: Array<FilterType>;
}

