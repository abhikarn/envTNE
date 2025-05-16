// src/app/interceptors/loader.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../shared/service/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  
  const token = authService.getJwtToken();

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    finalize(() => {
    })
  );
};
