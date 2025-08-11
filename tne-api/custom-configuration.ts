import { environment } from '../src/environment';
import { Configuration } from '../tne-api';

export class CustomConfiguration extends Configuration {
  constructor() {
    super({
      basePath: environment.production
        ? 'https://enaviya.co.in/spendmantraMobApi/'
        : 'https://localhost:44301/'
    });
  }
}
