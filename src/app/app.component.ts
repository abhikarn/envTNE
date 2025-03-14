import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../core/components/header/header.component';
import { SideMenuComponent } from '../core/components/side-menu/side-menu.component';
import { ExpenseModule } from './feature/expense/expense.module';
import { FeatureModule } from './feature/feature.module';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , HeaderComponent, SideMenuComponent, MatTabsModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'envTNE';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    const browserLang = navigator.language.split('-')[0];
    this.translate.use(browserLang.match(/en/) ? browserLang : 'en');
  }

  // changeLanguage(lang: string) {
  //   this.translate.use(lang);
  // }
  
}
