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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SideMenuComponent, MatTabsModule, TranslateModule, MatSnackBarModule, CommonModule, CoreModule, RouterModule],
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
    debugger;
    this.gettoken()

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.gettoken(); // Re-check auth state on every navigation
      });
  }

  gettoken() {
    const token = this.authService.getToken();  
    if (token && token.jwtTokenModel?.expireDateTime) {
      const expireTime = new Date(token.jwtTokenModel.expireDateTime).getTime();
      const currentTime = new Date().getTime();
  
      if (currentTime < expireTime) {
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
        this.authService.Logout(); // Token expired, force logout
      }
    } else {
      this.isAuthenticated = false;
    }
  }
  // changeLanguage(lang: string) {
  //   this.translate.use(lang);
  // }

}
