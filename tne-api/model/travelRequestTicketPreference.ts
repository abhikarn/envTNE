/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { TravelRequestTicketPreferenceType } from './travelRequestTicketPreferenceType';


export interface TravelRequestTicketPreference { 
    TravelRequestTicketId?: string;
    TravelRequestTicketPreferenceType?: Array<TravelRequestTicketPreferenceType>;
    IsActive?: boolean;
    Status?: string;
    ActionBy?: number;
    TransactionId?: string;
    CommunicationSeenCount?: number;
}

