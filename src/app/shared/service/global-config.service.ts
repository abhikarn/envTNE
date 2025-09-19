// shared/services/global-config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface GlobalConfig {
  decimalPrecision?: number;
  dateFormat?: string;   // e.g. 'dd/MM/yyyy', 'yyyy-MM-dd', 'dd-MMM-yyyy'
  locale?: string;       // e.g. 'en-GB', 'en-US'
  // Add other configurable fields here as needed
}

@Injectable({ providedIn: 'root' })
export class GlobalConfigService {
  private config: GlobalConfig = {
    decimalPrecision: 2,
    dateFormat: 'dd-MMM-yyyy',
    locale: 'en-GB'
  };

  constructor(private http: HttpClient) { }

  /**
   * Called at app startup via provideAppInitializer
   */
  loadConfig(): Promise<void> {
    return lastValueFrom(
      this.http.get<GlobalConfig>('assets/config/global-config.json')
    )
      .then(data => {
        this.config = { ...this.config, ...data };
        console.log('[GlobalConfigService] Loaded config:', this.config);
      })
      .catch(err => {
        console.error('Failed to load global config:', err);
        return Promise.resolve(); // Let app continue with defaults
      });
  }

  /**
   * Global decimal precision setting (fallback = 2)
   */
  getDecimalPrecision(): number {
    return this.config.decimalPrecision ?? 2;
  }

  /**
   * Global date format string used in pipes, material formats, etc.
   */
  get dateFormat(): string {
    return this.config.dateFormat ?? 'dd-MMM-yyyy';
  }

  get dateTimeFormat(): string {
    return this.config.dateFormat ? `${this.config.dateFormat} HH:mm` : 'dd-MMM-yyyy HH:mm';
  }

  /**
   * Used for Angular Material's MAT_DATE_LOCALE or DateAdapter.setLocale()
   */
  get locale(): string {
    return this.config.locale ?? 'en-GB';
  }

  /**
   * Get the full config object
   */
  getConfig(): GlobalConfig {
    return this.config;
  }
}
