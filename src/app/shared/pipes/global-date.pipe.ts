// shared/pipes/global-date.pipe.ts
import { Pipe, PipeTransform, Inject, Optional } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GLOBAL_DATE_FORMAT } from '../../tokens/global-date-format.token';

@Pipe({
  name: 'globalDate',
  standalone: true
})
export class GlobalDatePipe implements PipeTransform {
  constructor(
    private datePipe: DatePipe,
    @Optional() @Inject(GLOBAL_DATE_FORMAT) private defaultFormat: string
  ) { }

  transform(value: any, format?: string): string | null {
    return this.datePipe.transform(value, format || this.defaultFormat);
  }
}
