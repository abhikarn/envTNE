// shared/pipes/decimal-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConfigService } from '../service/global-config.service';

@Pipe({
    name: 'decimalFormat',
    standalone: true
})
export class DecimalFormatPipe implements PipeTransform {
    constructor(private configService: GlobalConfigService) { }

    transform(value: any): string {
        const precision = this.configService.getDecimalPrecision();
        const num = parseFloat(value ?? 0);
        return !isNaN(num) ? num.toFixed(precision) : '0'.padEnd(precision + 2, '0');
    }
}
