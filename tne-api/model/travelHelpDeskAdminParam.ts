/**
 * My API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { CityListType } from './cityListType';


export interface TravelHelpDeskAdminParam { 
    UserMasterId?: number;
    CityListType?: Array<CityListType>;
    IsActive?: boolean;
    Status?: string;
    ActionBy?: number;
    TransactionId?: string;
    CommunicationSeenCount?: number;
}

