// src/app/interceptors/loader.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../shared/service/loader/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (request, next) => {
  const loaderService = inject(LoaderService);
  
  loaderService.show();

  return next(request).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};
