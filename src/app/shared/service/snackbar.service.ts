import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  showMessage(
    message: string,
    action: string = 'Close',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-default']
  ) {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass,
    });
  }

  success(message: string, duration: number = 3000) {
    this.showMessage(message, 'OK', duration, ['snackbar-success']);
  }

  error(message: string, duration: number = 3000) {
    this.showMessage(message, 'OK', duration, ['snackbar-error']);
  }

  warning(message: string, duration: number = 3000) {
    this.showMessage(message, 'OK', duration, ['snackbar-warning']);
  }

  info(message: string, duration: number = 3000) {
    this.showMessage(message, 'OK', duration, ['snackbar-info']);
  }
}
