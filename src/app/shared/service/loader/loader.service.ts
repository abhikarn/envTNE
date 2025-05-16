// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//     providedIn: 'root',
// })
// export class LoaderService {
//     private isLoading = new BehaviorSubject<boolean>(false);
//     loading$ = this.isLoading.asObservable();

//     show(): void {
//         this.isLoading.next(true);
//     }

//     hide(): void {
//         this.isLoading.next(false);
//     }
// }

// src/app/services/loader.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private requestCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    if (this.requestCount > 0) {
      this.requestCount--;
    }

    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }
}
