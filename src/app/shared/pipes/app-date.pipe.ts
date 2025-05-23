import { Pipe, PipeTransform }  from '@angular/core';
import { DatePipe }             from '@angular/common';
import { GlobalConfigService } from '../service/global-config.service';

@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  constructor(
    private datePipe: DatePipe,
    private config: GlobalConfigService
  ) {}

  transform(value: any): string | null {
    return this.datePipe.transform(value, this.config.dateFormat);
  }
}
