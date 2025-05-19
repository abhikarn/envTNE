import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { loaderInterceptor } from './interceptors/loader.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from './tokens/custom-date-adapter';
import { GlobalConfigService } from './shared/service/global-config.service';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/dd/yyyy',
  },
  display: {
    dateInput: 'MM/dd/yyyy',        // What the user sees in the input
    monthYearLabel: 'MMM yyyy',     // Label in month/year picker
    dateA11yLabel: 'MM/dd/yyyy',    // Accessibility label
    monthYearA11yLabel: 'MMMM yyyy' // Accessibility for month/year
  },
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([loaderInterceptor])),
    provideHttpClient(withInterceptors([AuthInterceptor])),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),

    // { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    // { provide: DateAdapter, useClass: CustomDateAdapter },
    // { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },

     // ✅ Global date configuration
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensures dd/MM/yyyy calendar
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    {
      provide: 'APP_INITIALIZER',
      useFactory: (configService: GlobalConfigService) => () => configService.loadConfig(),
      deps: [GlobalConfigService],
      multi: true
    }
  ],
};
