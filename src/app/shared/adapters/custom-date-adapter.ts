import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  formato = 'YYYY/MM/DD';

  override parse(value: any): Date | null {
    const parts = value.match(/\d{1,4}/g);
    if (parts && parts.length === 3) {
      const order = this.formato.match(/Y{2,4}|M{1,2}|D{1,2}/g);
      if (order) {
        const year = +parts[order.indexOf('YYYY') < 0 ? order.indexOf('YY') : order.indexOf('YYYY')];
        const month = +parts[order.indexOf('MM') < 0 ? order.indexOf('M') : order.indexOf('MM')];
        const day = +parts[order.indexOf('DD') < 0 ? order.indexOf('D') : order.indexOf('DD')];
        return new Date(year < 100 ? year + 2000 : year, month - 1, day);
      }
    }
    return null;
  }

  override format(date: Date, displayFormat: string): string {
    return displayFormat
      .replace('YYYY', date.getFullYear().toString())
      .replace('YY', (date.getFullYear() % 100).toString())
      .replace('MMM', this.getMonthNames('long')[date.getMonth()])
      .replace('MM', ('00' + (date.getMonth() + 1)).slice(-2))
      .replace('M', (date.getMonth() + 1).toString())
      .replace('DD', ('00' + date.getDate()).slice(-2))
      .replace('D', date.getDate().toString());
  }
}
