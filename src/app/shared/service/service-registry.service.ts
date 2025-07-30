import { Injectable } from '@angular/core';
import { DataService, ExpenseService, UserService } from '../../../../tne-api';
import { TravelService } from '../../../../tne-api';
import { NewExpenseService } from '../../feature/expense/service/new-expense.service';
import { DistanceFinderService } from './distance-finder.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistryService {

  private services: { [key: string]: any } = {};

  constructor(
    private dataService: DataService,
    private travelService: TravelService,
    private expenseService: ExpenseService,
    private newExpenseService: NewExpenseService,
    private userService: UserService,
    private distanceFinderService: DistanceFinderService
  ) {
    this.services['DataService'] = this.dataService;
    this.services['TravelService'] = this.travelService;
    this.services['ExpenseService'] = this.expenseService;
    this.services['NewExpenseService'] = this.newExpenseService;
    this.services['UserService'] = this.userService;
    this.services['DistanceFinderService'] = this.distanceFinderService;
  }

  getService(serviceName: string): any {
    return this.services[serviceName] || null;
  }
}
