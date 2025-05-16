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

  getJwtToken(): string | "" {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.token.jwtTokenModel.jwtToken || "";
      } catch (error) {
        return "";
      }
    }
    return "";
  }

  getUserMasterId(): number | 0 {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.token.userMasterId || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  getUserDisplayCode(): string | '' {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.token.displayCode || "";
      } catch (error) {
        return "";
      }
    }
    return "";
  }

  getUserDisplayName(): string | '' {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.token.displayName || "";
      } catch (error) {
        return "";
      }
    }
    return "";
  }
 
  Logout(): void {
    localStorage.removeItem('userData');
    this.router.navigate(['/account']); // Adjust route as needed
  }
}
