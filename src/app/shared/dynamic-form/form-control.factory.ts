import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFormControl } from './form-control.interface';
import { BaseFormControlStrategy } from './strategies/base-form-control-strategy';
import { TextInputStrategy } from './strategies/text-input-strategy';
import { SelectInputStrategy } from './strategies/select-input-strategy';
import { DateInputStrategy } from './strategies/date-input-strategy';
import { PasswordInputStrategy } from './strategies/password-input-strategy';
import { MultiSelectInputStrategy } from './strategies/multi-select-input-strategy';
import { GstInputStrategy } from './strategies/gst-input-strategy';
import { CostCenterStrategy } from './strategies/cost-center-strategy';
import { LineWiseCostCenterStrategy } from './strategies/line-wise-cost-center-strategy';

export type FormControlType = 'text' | 'select' | 'date' | 'password' | 'multiSelect' | 'gst' | 'costCenter' | 'lineWiseCostCenter';

@Injectable({
  providedIn: 'root'
})
export class FormControlFactory {
  private static instance: FormControlFactory;
  private strategyMap: Map<FormControlType, BaseFormControlStrategy> = new Map();

  constructor() {
    if (!FormControlFactory.instance) {
      FormControlFactory.instance = this;
      this.initializeStrategyMap();
    }
    return FormControlFactory.instance;
  }

  private initializeStrategyMap(): void {
    this.strategyMap = new Map([
      ['text', new TextInputStrategy()],
      ['select', new SelectInputStrategy()],
      ['date', new DateInputStrategy()],
      ['password', new PasswordInputStrategy()],
      ['multiSelect', new MultiSelectInputStrategy()],
      ['gst', new GstInputStrategy()],
      ['costCenter', new CostCenterStrategy()],
      ['lineWiseCostCenter', new LineWiseCostCenterStrategy()]
    ]);
  }

  public static getInstance(): FormControlFactory {
    if (!FormControlFactory.instance) {
      FormControlFactory.instance = new FormControlFactory();
    }
    return FormControlFactory.instance;
  }

  public static createControl(config: IFormControl): FormControl {
    return FormControlFactory.getInstance().createControl(config);
  }

  public createControl(config: IFormControl): FormControl {
    try {
      const controlType = (config.type || 'text') as FormControlType;
      const strategy = this.strategyMap.get(controlType);

      if (!strategy) {
        console.warn(`No strategy found for control type: ${controlType}, falling back to text input`);
        return this.strategyMap.get('text')!.createControl(config);
      }

      return strategy.createControl(config);
    } catch (error) {
      console.error('Error creating form control:', error);
      // Return a basic text control as fallback
      return new FormControl(config.value || '');
    }
  }

  public registerStrategy(type: FormControlType, strategy: BaseFormControlStrategy): void {
    this.strategyMap.set(type, strategy);
  }
}
