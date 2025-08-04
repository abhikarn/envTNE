import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment'
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DistanceFinderService {
  basePath = 'https://enaviya.co.in/DistanceFinder/api';
  private token: string | null = null;

  constructor(private http: HttpClient) { }

  // Fetch and store token
  fetchAndStoreToken(): Observable<any> {
    const url = `${this.basePath}/Auth/token`;
    return this.http.get(url).pipe(
      switchMap((response: any) => {
        this.token = response?.token || null;
        return of(this.token);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  getAutocomplete(term: string): Observable<any> {
    const url = `${this.basePath}/Geocoding/autocomplete?term=${term}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  getDistanceUsingGoogleAPI(origin: string, destination: string): Observable<any> {
    const url = `${this.basePath}/Geocoding/CalculateDistanceUsingGoogleAPI?origin=${origin}&destination=${destination}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }
}
