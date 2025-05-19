// shared/services/global-config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService {
  private config: any = {};

  constructor(private http: HttpClient) { }

  loadConfig(): Promise<void> {
    debugger
    return lastValueFrom(this.http.get<any>('/assets/config/global-config.json'))
      .then((data) => {
        this.config = data;
      })
      .catch((err) => {
        console.error('Failed to load global config:', err);
        return Promise.resolve(); // Prevent app from blocking
      });
  }

  getDecimalPrecision(): number {
    debugger
    return this.config.decimalPrecision || 2;
  }

  getConfig(): any {
    return this.config;
  }
}
