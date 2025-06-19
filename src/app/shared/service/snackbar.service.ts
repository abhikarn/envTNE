import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/portal';
import { CustomSnackbarComponent } from '../component/custom-snackbar/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  private openCustomSnackbar(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration: number = 3000
  ) {
    this.snackBar.openFromComponent(CustomSnackbarComponent as ComponentType<any>, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      data: { message, type }
    });
  }

  showMessage(
    message: string,
    action: string = 'Close',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-default']
  ) {
    // fallback to default snackbar if needed
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass
    });
  }

  success(message: string, duration: number = 3000) {
    this.openCustomSnackbar(message, 'success', duration);
  }

  error(message: string, duration: number = 3000) {
    this.openCustomSnackbar(message, 'error', duration);
  }

  warning(message: string, duration: number = 3000) {
    this.openCustomSnackbar(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000) {
    this.openCustomSnackbar(message, 'info', duration);
  }
}
