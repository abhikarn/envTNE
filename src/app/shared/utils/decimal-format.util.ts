// shared/utils/decimal-format.util.ts
import { inject } from '@angular/core';
import { GlobalConfigService } from '../service/global-config.service';

export function formatDecimal(value: any): string {
    const configService = inject(GlobalConfigService);
    const precision = configService.getDecimalPrecision();
    const num = parseFloat(value ?? 0);
    return !isNaN(num) ? num.toFixed(precision) : '0'.padEnd(precision + 2, '0');
}
