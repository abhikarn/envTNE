import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../core/components/header/header.component';
import { SideMenuComponent } from '../core/components/side-menu/side-menu.component';
import { ExpenseModule } from './feature/expense/expense.module';
import { FeatureModule } from './feature/feature.module';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../src/app/shared/service/auth.service'
import { CoreModule } from '../core/core.module';
import { filter } from 'rxjs';
import { LoaderComponent } from './shared/loader/loader.component';
import { MobileNavComponent } from '../core/components/mobile-nav/mobile-nav.component';
import { PlatformService } from './shared/service/platform.service';
import { NewExpenseService } from './feature/expense/service/new-expense.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, HeaderComponent, SideMenuComponent, MatTabsModule, TranslateModule, MatSnackBarModule, CommonModule, CoreModule, RouterModule, MobileNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'envTNE';
  isAuthenticated = false;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private platformService: PlatformService,
    private newExpenseService: NewExpenseService
  ) {
    this.translate.setDefaultLang('en');
    const browserLang = navigator.language.split('-')[0];
    this.translate.use(browserLang.match(/en/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    // Handle deep link first
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.readTokenForSSO(event.urlAfterRedirects);
    });
  }

  readTokenForSSO(url: string) {
    console.log('AppComponent initialized with SSO URL:', url);
    const queryParams = new URLSearchParams(window.location.search);
    let tokenStr = queryParams.get('token');

    // If no token in query params, check localStorage
    if (!tokenStr) {
      tokenStr = localStorage.getItem('token');
    }

    console.log('SSO Token:', tokenStr);

    if (tokenStr) {
      try {
        const payload = tokenStr.split('.')[1]; // JWT structure
        const decoded = JSON.parse(atob(payload));
        console.log('Decoded JWT Payload:', decoded);

        // Save token if it's new
        localStorage.setItem('token', tokenStr);

        if (decoded.exp) {
          const expireTime = decoded.exp * 1000;
          const currentTime = new Date().getTime();

          if (currentTime < expireTime) {
            this.newExpenseService.GetUserData({
              sessionId: decoded.jti, // use token's jti as session
            }).subscribe({
              next: (userDataResponse: any) => {
                if (!userDataResponse || !userDataResponse.token) {
                  alert('Invalid user data received. Please log in again.');
                  this.authService.Logout();
                  return;
                }
                this.isAuthenticated = true;
                console.log('LoginComponent: GetUserData response', userDataResponse);
                localStorage.setItem('sessionId', decoded.jti);
                localStorage.setItem('userData', JSON.stringify(userDataResponse));
                localStorage.setItem('userMasterId', userDataResponse.token.userMasterId);
                this.authService.setToken(userDataResponse.token);
                this.authService.setUserMasterId(userDataResponse.token.userMasterId);
                setTimeout(() => {
                  this.router.navigate(['/expense/expense/dashboard']);
                }, 3000);
              }
            });
          } else {
            this.isAuthenticated = false;
            alert('Session expired. Please log in again.');
            this.authService.Logout();
          }
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    } else {
      this.handleDeepLink(url);
    }
  }



  private handleDeepLink(url: string): void {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get('accessToken');
    const callbackUrl = queryParams.get('callbackUrl');
    const platform = queryParams.get('platform');

    if (accessToken && callbackUrl && platform) {
      // Send to your backend for validation
      this.authService.validatePeopleStrongSession({ accessToken, callbackUrl, platform })
        .subscribe({
          next: () => {
            this.isAuthenticated = true;
            this.platformService.setPlatform(platform === 'Mobile')
            this.router.navigate(['/expense/expense/dashboard']);
          },
          error: () => {
            this.authService.Logout();
            this.router.navigate(['/account']);
          }
        });
    } else {
      // Fallback to normal local token validation
      this.gettoken(url);
    }
  }


  gettoken(url: string) {
    const token = this.authService.getToken();
    const currentUrl = url;

    // Define routes that don't require authentication
    const publicRoutes = ['/account/forgot-password', '/account/reset-password'];

    if (token && token.jwtTokenModel?.expireDateTime) {
      const expireTime = new Date(token.jwtTokenModel.expireDateTime).getTime();
      const currentTime = new Date().getTime();

      if (currentTime < expireTime) {
        this.isAuthenticated = true;
        // Redirect to dashboard if authenticated and on /account
        if (currentUrl.toLowerCase() === '/account') {
          this.router.navigate(['/expense/expense/dashboard']);
        }
      } else {
        this.isAuthenticated = false;
        alert('Session expired. Please log in again.');
        this.authService.Logout();
        this.router.navigate(['/account']);
      }
    } else {
      this.isAuthenticated = false;

      // Redirect only if the current route is not in publicRoutes
      if (!publicRoutes.includes(currentUrl.toLowerCase())) {
        this.router.navigate(['/account']);
      }
    }
  }

}
