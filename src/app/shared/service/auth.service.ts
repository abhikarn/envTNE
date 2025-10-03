import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  setToken(token: any): void {
    localStorage.setItem('userData', JSON.stringify({ token }));
  }

  setUserMasterId(userMasterId: number): void {
    localStorage.setItem('userMasterId', userMasterId.toString());
  }

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
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userMasterId');
    localStorage.removeItem('token');
    localStorage.removeItem('loginType');
    this.router.navigate(['/account']); // Adjust route as needed
  }
}
