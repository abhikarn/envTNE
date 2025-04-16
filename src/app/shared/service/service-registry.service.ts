import { Injectable } from '@angular/core';
import { DataService } from '../../../../tne-api';
import { TravelService } from '../../../../tne-api';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistryService {

  private services: { [key: string]: any } = {};

  constructor(
    private dataService: DataService,
    private travelService: TravelService
  ) {
    this.services['DataService'] = this.dataService;
    this.services['TravelService'] = this.travelService;
  }

  getService(serviceName: string): any {
    return this.services[serviceName] || null;
  }
}
