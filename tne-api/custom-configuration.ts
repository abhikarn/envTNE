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

// import { environment } from '../src/environment';
// import { Configuration } from '../tne-api';

// export class CustomConfiguration extends Configuration {
//   constructor() {
//     super({
//       basePath: environment.production
//         ? 'https://demonew.enavexpense.com/MobApi/'
//         : 'https://localhost:44301/'
//     });
//   }
// }

// import { environment } from '../src/environment';
// import { Configuration } from '../tne-api';

// export class CustomConfiguration extends Configuration {
//   constructor() {
//     super({
//       basePath: environment.production
//         ? 'https://spendmantranew.enavexpense.com/MobApi/'
//         : 'https://localhost:44301/'
//     });
//   }
// }