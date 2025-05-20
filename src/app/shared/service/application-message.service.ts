import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationMessageByFlagParam, DataService, DataSubmit } from '../../../../tne-api';

@Injectable({
    providedIn: 'root'
})
export class ApplicationMessageService {
    constructor(private dataService: DataService) { }

    public getApplicationMessage(applicationMessageByFlagParam: ApplicationMessageByFlagParam): Observable<any> {
        return this.dataService.dataGetApplicationMessage(applicationMessageByFlagParam);
    }
}
