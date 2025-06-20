import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-custom-snackbar',
  imports: [NgClass, TitleCasePipe],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.scss',
  encapsulation: ViewEncapsulation.None,
  
})
export class CustomSnackbarComponent {
   
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string; type: string }) {}

  get toastClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'toast-green';
      case 'error':
        return 'toast-red';
      case 'warning':
        return 'toast-yellow';
      case 'info':
        return 'toast-blue';
      default:
        return 'toast-green';
    }
  }
}
