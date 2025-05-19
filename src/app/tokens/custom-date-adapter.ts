import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    constructor() {
        super();
        alert('CustomDateAdapter instantiated'); // Debugging alert
        console.log('CustomDateAdapter instantiated');
    }

    override format(date: Date, displayFormat: Object): string {
        alert('CustomDateAdapter format method called'); // Debugging alert
        console.log('CustomDateAdapter format method called with date:', date);
        const day = this._to2digit(date.getDate());
        const month = date.toLocaleString('en-US', { month: 'short' }); // Ensure short month name
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private _to2digit(n: number) {
        return n < 10 ? '0' + n : n;
    }
}
