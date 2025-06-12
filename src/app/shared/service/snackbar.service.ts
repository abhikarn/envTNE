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
    console.log(panelClass)
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass
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
