import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-profile',
  imports: [],
  templateUrl: './mobile-profile.component.html',
  styleUrl: './mobile-profile.component.scss'
})
export class MobileProfileComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<MobileProfileComponent>,
    private router: Router
  ) { }

  logout() {
    localStorage.removeItem('userData');
    this.bottomSheetRef.dismiss();
    this.router.navigate(['/account']);
  }
}
