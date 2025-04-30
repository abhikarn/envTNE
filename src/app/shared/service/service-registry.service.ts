import { Injectable } from '@angular/core';
import { DataService, ExpenseService } from '../../../../tne-api';
import { TravelService } from '../../../../tne-api';
import { NewExpenseService } from '../../feature/expense/service/new-expense.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistryService {

  private services: { [key: string]: any } = {};

  constructor(
    private dataService: DataService,
    private travelService: TravelService,
    private expenseService: ExpenseService,
    private newExpenseService: NewExpenseService
  ) {
    this.services['DataService'] = this.dataService;
    this.services['TravelService'] = this.travelService;
    this.services['ExpenseService'] = this.expenseService;
    this.services['NewExpenseService'] = this.newExpenseService;
  }

  getService(serviceName: string): any {
    return this.services[serviceName] || null;
  }
}
