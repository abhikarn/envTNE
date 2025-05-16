// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideHttpClient, HttpClient } from '@angular/common/http';
// import { importProvidersFrom } from '@angular/core';
// import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { GLOBAL_DATE_FORMAT } from './tokens/global-date-format.token';

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// export const appConfig: ApplicationConfig = {
//   providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(),
//     importProvidersFrom(
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useFactory: HttpLoaderFactory,
//           deps: [HttpClient],
//         },
//       })
//     ),
//     { provide: GLOBAL_DATE_FORMAT, useValue: 'dd-MMM-yyyy' }
//   ]
// };


import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GLOBAL_DATE_FORMAT } from './tokens/global-date-format.token';
import { loaderInterceptor } from './interceptors/loader.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
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
    { provide: GLOBAL_DATE_FORMAT, useValue: 'dd-MMM-yyyy' },
  ]
};
