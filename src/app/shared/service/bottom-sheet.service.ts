import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  constructor(private bottomSheet: MatBottomSheet) { }
  openBottomSheet<T extends ComponentType<any>, D = any, R = any>(component: T, data?: D): Observable<R | undefined> {
    const bottomSheetRef = this.bottomSheet.open(component, {
      data,
      // Optional: customize bottom sheet appearance
      panelClass: 'custom-bottom-sheet'
    });

    return bottomSheetRef.afterDismissed();
  }
  
}
