import { Injectable } from '@angular/core';
import { DataService } from '../../../../tne-api';

@Injectable({
  providedIn: 'root'
})
export class ServiceRegistryService {

  private services: { [key: string]: any } = {};

  constructor(private dataService: DataService) {
    this.services['DataService'] = this.dataService;
  }

  getService(serviceName: string): any {
    return this.services[serviceName] || null;
  }
}
