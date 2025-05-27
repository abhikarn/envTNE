import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  simplifyObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.simplifyObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          // Check if value is a Date object or a valid date string
          if (
            (value instanceof Date && !isNaN(value.getTime())) ||
            (typeof value === 'string' && moment(value, moment.ISO_8601, true).isValid())
          ) {
            newObj[key] = new Date(value).toISOString();
          } else if (value && typeof value === 'object' && 'value' in value && 'label' in value) {
            newObj[key] = value.value;
          } else {
            newObj[key] = this.simplifyObject(value);
          }
        }
      }
      return newObj;
    }
    return obj;
  }

  mergeData(entries: { name: number; data: any }[]): any[] {
    const mergedMap = new Map<number, any>();
    entries.forEach(entry => {
      if (mergedMap.has(entry.name)) {
        let existingData = mergedMap.get(entry.name);
        if (Array.isArray(existingData.data)) {
          existingData.data.push(entry.data);
        } else {
          existingData.data = [existingData.data, entry.data];
        }
      } else {
        mergedMap.set(entry.name, { name: entry.name, data: entry.data });
      }
    });
    return Array.from(mergedMap.values());
  }

}
