import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {
  // State management for future use
  private costCenterData = new BehaviorSubject<any>(null);
  private gstData = new BehaviorSubject<any>(null);

  // Cost Center methods
  setCostCenterData(data: any): void {
    this.costCenterData.next(data);
  }

  getCostCenterData(): Observable<any> {
    return this.costCenterData.asObservable();
  }

  // GST methods
  setGstData(data: any): void {
    this.gstData.next(data);
  }

  getGstData(): Observable<any> {
    return this.gstData.asObservable();
  }

  // Common methods
  clearData(): void {
    this.costCenterData.next(null);
    this.gstData.next(null);
  }
} 