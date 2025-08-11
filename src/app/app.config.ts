import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { loaderInterceptor } from './interceptors/loader.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';
import { GlobalConfigService } from './shared/service/global-config.service';
import { DateFormatService } from './shared/service/date-format.service';
import { Configuration } from '../../tne-api';
import { CustomConfiguration } from '../../tne-api/custom-configuration';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([loaderInterceptor])),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideNativeDateAdapter(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    provideAppInitializer(() => {
      const configService = inject(GlobalConfigService);
      console.log('[App Init] Loading global-config.json...');
      return configService.loadConfig();
    }),
    // Global date configuration
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: MAT_DATE_FORMATS,
      useFactory: () => {
        const format = inject(DateFormatService).formats;
        console.log('[MAT_DATE_FORMATS] resolved:', format);
        return format;
      }
    },
    { provide: Configuration, useClass: CustomConfiguration}
  ]
};


