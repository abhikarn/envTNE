import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  getToken(): any | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.token || null;
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        return null;
      }
    }
    return null;
  }

  Logout(): void {
    debugger;
    localStorage.removeItem('userData');
    this.router.navigate(['/account']); // Adjust route as needed
  }
}
