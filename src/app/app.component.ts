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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, HeaderComponent, SideMenuComponent, MatTabsModule, TranslateModule, MatSnackBarModule, CommonModule, CoreModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'envTNE';
  isAuthenticated = false;

  constructor(private translate: TranslateService, private authService: AuthService, private router: Router) {
    this.translate.setDefaultLang('en');
    const browserLang = navigator.language.split('-')[0];
    this.translate.use(browserLang.match(/en/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.gettoken(event.urlAfterRedirects); // Use actual navigated URL
    });
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
