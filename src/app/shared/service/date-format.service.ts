import { Injectable } from '@angular/core';
import { GlobalConfigService } from './global-config.service';
import { MatDateFormats } from '@angular/material/core';

@Injectable({ providedIn: 'root' })
export class DateFormatService {
  constructor(private cfg: GlobalConfigService) { }

  get formats(): MatDateFormats {
    const format = this.cfg.dateFormat || 'dd-MMM-yyyy';
     console.log('[DateFormatService] using format:', format); // Debug
    return {
      parse: { dateInput: format },
      display: {
        dateInput: format,
        monthYearLabel: 'MMM yyyy',
        dateA11yLabel: format,
        monthYearA11yLabel: 'MMMM yyyy',
      }
    };
  }
}
