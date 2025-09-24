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
      parse: {
        dateInput: 'YYYY-MM-DD',
        timeInput: 'HH:mm:ss',
      },
      display: {
        dateInput: 'DD/MM/YYYY',
        timeInput: 'HH:mm:ss',
        timeOptionLabel: 'HH:mm:ss',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      }
    };
  }
}
