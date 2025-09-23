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
import { SessionTimeoutService } from './shared/service/session-timeout.service';
import { ConfirmDialogService } from './shared/service/confirm-dialog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, HeaderComponent, SideMenuComponent, MatTabsModule, TranslateModule, MatSnackBarModule, CommonModule, CoreModule, RouterModule, MobileNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'envTNE';
  isAuthenticated = false;
  showIdleWarning = false;
  private idleStarted = false;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private platformService: PlatformService,
    private newExpenseService: NewExpenseService,
    private sessionTimeoutService: SessionTimeoutService,
    private confirmDialogService: ConfirmDialogService
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
    // If user is already logged-in on initial load (token in localStorage), start idle watcher
    const token = this.authService.getToken();
    if (token && token.jwtTokenModel?.expireDateTime) {
      const expireTime = new Date(token.jwtTokenModel.expireDateTime).getTime();
      if (Date.now() < expireTime) {
        this.onAuthenticated();
      }
    }
  }

  private onAuthenticated() {
    console.log('AppComponent: onAuthenticated() called, starting idle watcher');
    this.isAuthenticated = true;
    if (!this.idleStarted) {
      this.startIdleWatcherIfNeeded();
      this.idleStarted = true;
    }
  }


  // Example: call this after you set isAuthenticated true in your login/deep-link success paths
  private startIdleWatcherIfNeeded() {
    // allow quick test with ?sessionTimeoutTest=1
    const urlParams = new URLSearchParams(window.location.search);
    const isTest = urlParams.get('sessionTimeoutTest') === '1';

    if (isTest) {
      console.log('Idle watcher: TEST mode enabled (short timers)');
      // test: idle after ~10s, warning 5s
      this.sessionTimeoutService.startWatching(
        2,
        1,
        () => this.showWarning(),
        () => this.handleTimeout()
      );
    } else {
      // production: 20 minutes idle, 2 minutes warning
      this.sessionTimeoutService.startWatching(
        20,
        2,
        () => this.showWarning(),
        () => this.handleTimeout()
      );
    }
  }

  private showWarning() {
    console.log('AppComponent: show idle warning');
    this.showIdleWarning = true;
    this.confirmDialogService.confirm(
      {
        title: 'Session Timeout',
        message: 'You have been idle for a while. Do you want to stay logged in?',
        confirmText: 'Stay Logged In',
        cancelText: 'Logout'
      }
    ).subscribe((result) => {
      if (result) {
        this.stayLoggedIn();
      } else {
        this.logout();
      }
    });
  }

  stayLoggedIn() {
    console.log('AppComponent: stayLoggedIn clicked');
    this.showIdleWarning = false;
    this.confirmDialogService.close(); // close the confirmation dialog
    this.sessionTimeoutService.resetTimer(); // reset timers
  }

  logout() {
    console.log('AppComponent: logout triggered');
    this.showIdleWarning = false;
    this.confirmDialogService.close(); // close the confirmation dialog
    this.sessionTimeoutService.stopWatching();
    this.isAuthenticated = false;

    // Clear local session
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userMasterId');
    localStorage.removeItem('token');
    localStorage.removeItem('loginType');

    const loginType = localStorage.getItem('loginType');

    if (loginType === 'SSO') {
      // SSO users: redirect to SSO Entry point
      window.location.href = 'https://s2demo.peoplestrong.com/oneweb/#/home';

    } else if (loginType === 'DeepLink') {
      // deep link users: redirect to deep link entry
      window.location.href = 'https://your-deeplink-entry.example.com';
    } else {
      // regular users
      this.router.navigate(['/account']);
    }
  }

  private handleTimeout() {
    console.log('AppComponent: idle timeout reached, logging out');
    this.logout();
  }

  readTokenForSSO(url: string) {
    console.log('AppComponent initialized with SSO URL:', url);
    const queryParams = new URLSearchParams(window.location.search);
    let sessionId = queryParams.get('token');

    console.log('SSO Token:', sessionId);

    if (sessionId) {
      try {
         this.newExpenseService.GetUserData({
              sessionId: sessionId, // use token's jti as session
            }).subscribe({
              next: (userDataResponse: any) => {
                if (!userDataResponse || !userDataResponse.token) {
                  alert('Invalid user data received. Please log in again.');
                  this.authService.Logout();
                  return;
                }
                this.isAuthenticated = true;
                this.onAuthenticated();
                localStorage.setItem('loginType', 'SSO');
                localStorage.setItem('sessionId', sessionId);
                localStorage.setItem('userData', JSON.stringify(userDataResponse));
                localStorage.setItem('userMasterId', userDataResponse.token.userMasterId);
                this.authService.setToken(userDataResponse.token);
                this.authService.setUserMasterId(userDataResponse.token.userMasterId);
                this.router.navigate(['/expense/expense/dashboard']);
              }
            });

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
            localStorage.setItem('loginType', 'DeepLink');
            this.onAuthenticated();
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
        this.onAuthenticated();
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
