import { Injectable } from '@angular/core';

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface SetFieldConfig {
  name: string;
  formula: string;
  dependsOn: string[];
  types: Record<string, DataType>;
  defaultValue?: any;
  roundOff?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormulaEvaluatorService {

  evaluateSetFields(setFields: SetFieldConfig[], allValues: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of setFields) {
      const inputValues: Record<string, any> = {};
      for (const key of field.dependsOn) {
        const type = field.types[key] || 'string';
        let value = allValues[key];
        if (value === undefined || value === null) {
          value = this.getDefaultForType(type);
        } else {
          value = this.convertValueByType(value, type);
        }
        inputValues[key] = value;
      }

      try {
        const fn = new Function(...field.dependsOn, `return ${field.formula};`);
        let value = fn(...field.dependsOn.map(k => inputValues[k]));

        if (field.roundOff !== undefined && typeof value === 'number') {
          value = parseFloat(value.toFixed(field.roundOff));
        }

        result[field.name] = value;
      } catch (err) {
        console.warn(`Error evaluating formula for ${field.name}:`, err);
        result[field.name] = field.defaultValue ?? 0;
      }
    }

    return result;
  }

  private convertValueByType(value: any, type: DataType): any {
    switch (type) {
      case 'number':
        return Number(value) || 0;
      case 'boolean':
        return value === 'true' || value === true;
      case 'date':
        if (typeof value === 'string') {
          return new Date(value.split('T')[0] + 'T00:00:00Z').getTime();
        }
        return value instanceof Date ? value.getTime() : 0;
      case 'array':
        return Array.isArray(value) ? value : [];
      case 'object':
        return typeof value === 'object' ? value : {};
      case 'string':
      default:
        return String(value);
    }
  }

  private getDefaultForType(type: DataType): any {
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return 0;
      case 'array':
        return [];
      case 'object':
        return {};
      case 'string':
      default:
        return '';
    }
  }
}


// {
//   "setFields": [
//     {
//       "name": "EntitlementAmountInBaseCurrency",
//       "formula": "EntitlementAmount * EntitlementConversionRate",
//       "dependsOn": ["EntitlementAmount", "EntitlementConversionRate"],
//       "types": {
//         "EntitlementAmount": "number",
//         "EntitlementConversionRate": "number"
//       },
//       "defaultValue": 0,
//       "roundOff": 2
//     }
//   ]
// }

// Example usage: In Component
// const values = {
//   EntitlementAmount: 1000,
//   EntitlementConversionRate: 82
// };

// const config: SetFieldConfig[] = [
//   {
//     name: 'EntitlementAmountInBaseCurrency',
//     formula: 'EntitlementAmount * EntitlementConversionRate',
//     dependsOn: ['EntitlementAmount', 'EntitlementConversionRate'],
//     types: {
//       EntitlementAmount: 'number',
//       EntitlementConversionRate: 'number'
//     },
//     defaultValue: 0,
//     roundOff: 2
//   }
// ];

// const result = this.formulaEvaluatorService.evaluateSetFields(config, values);
// console.log(result);
