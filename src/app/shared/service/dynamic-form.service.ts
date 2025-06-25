import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor() { }


  scrollToFirstInvalidControl(querySelector: string): void {
    const firstInvalidControl: HTMLElement | null = document.querySelector(querySelector + ' .ng-invalid');

    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidControl.focus?.(); // optional
    }
  }
}
