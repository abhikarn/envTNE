import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private isMobileSubject = new BehaviorSubject<boolean>(false);

  // Observable that components can subscribe to
  isMobile$ = this.isMobileSubject.asObservable();

  // Method to set platform
  setPlatform(isMobile: boolean): void {
    this.isMobileSubject.next(isMobile);
  }

  // Optional getter
  isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
