import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import('vconsole').then((VConsole) => {
  new VConsole.default();
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
