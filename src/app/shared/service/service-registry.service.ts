import { Injectable } from '@angular/core';
import { DataService, ExpenseService } from '../../../../tne-api';
import { TravelService } from '../../../../tne-api';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistryService {

  private services: { [key: string]: any } = {};

  constructor(
    private dataService: DataService,
    private travelService: TravelService,
    private expenseService: ExpenseService
  ) {
    this.services['DataService'] = this.dataService;
    this.services['TravelService'] = this.travelService;
    this.services['ExpenseService'] = this.expenseService;
  }

  getService(serviceName: string): any {
    return this.services[serviceName] || null;
  }
}
