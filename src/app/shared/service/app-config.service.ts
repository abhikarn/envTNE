// app/services/app-config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return this.http.get('/assets/config/api-config.json')
      .toPromise()
      .then(config => {
        this.config = config;
      });
  }

  getEndpoint(endpointKey: string): string {
    // this.loadConfig();
    const base = this.config?.apiBaseUrl ?? '';
    const path = this.config?.endpoints?.[endpointKey];
    return `${base}/${path}`;
  }
}
