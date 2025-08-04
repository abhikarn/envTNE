import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../shared/service/loader/loader.service';

// Add URLs that should show loader
const LOADER_URLS = [
  '/api/expense',
  '/api/claims',
  '/api/reports',
  '/api/Dashboard',
  '/api/Ocr/upload'
  // Add more URLs as needed
];

export const loaderInterceptor: HttpInterceptorFn = (request, next) => {
  const loaderService = inject(LoaderService);
  
  // Check if the request URL should show loader
  const shouldShowLoader = LOADER_URLS.some(url => request.url.includes(url));

  if (shouldShowLoader) {
    loaderService.show();
  }

  return next(request).pipe(
    finalize(() => {
      if (shouldShowLoader) {
        loaderService.hide();
      }
    })
  );
};
