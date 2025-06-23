import { Injectable, Inject } from '@angular/core';
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { IFormControl } from '../form-control.interface';
import { FormControlFactory } from '../form-control.factory';
import { ServiceRegistryService } from '../../../shared/service/service-registry.service';
import { GlobalConfigService } from '../../../shared/service/global-config.service';
import { FormStateService } from './form-state.service';
import { FormEventService } from './form-event.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private formControlFactory = new FormControlFactory();

  constructor(
    @Inject(ServiceRegistryService) private serviceRegistry: ServiceRegistryService,
    @Inject(GlobalConfigService) private configService: GlobalConfigService,
    private formStateService: FormStateService,
    private formEventService: FormEventService
  ) {}

  createFormControls(formConfig: IFormControl[]): { formConfig: IFormControl, control: FormControl }[] {
    const formControls: { formConfig: IFormControl, control: FormControl }[] = [];
    const form = new FormGroup({});

    formConfig.forEach(config => {
      if (config.dataType === 'number') {
        this.setupAutoFormat(config);
      }
      const control = this.formControlFactory.createControl(config);
      formControls.push({ formConfig: config, control: control });
      form.addControl(config.name, control);
    });

    // Update form state
    this.formStateService.updateForm(form);
    this.formStateService.updateFormControls(formControls);

    return formControls;
  }

  handleFormEvent(eventType: string, data: { event: any; control: any }, eventHandler: any): void {
    const field = data.control;
    const event = data.event;
    const handlerName = field.events?.[eventType];

    if (handlerName && typeof eventHandler[handlerName] === 'function') {
      eventHandler[handlerName](event, field);
    } else {
      console.warn(`Handler '${handlerName}' is not defined for ${field.name}.`);
    }
  }

  prepareFormData(formControls: { formConfig: IFormControl, control: FormControl }[], form: FormGroup, category: any, referenceId: number = 0): any {
    const formData: any = {
      name: category.name,
      data: {
        ReferenceId: referenceId,
        excludedData: {}
      }
    };

    formControls.forEach(control => {
      const fieldName = control.formConfig.name;
      let fieldValue = form.value[fieldName];

      control.formConfig.value = fieldValue;
      
      if (control.formConfig.isExcluded) {
        formData.data.excludedData[fieldName] = fieldValue ?? null;
      } else {
        formData.data[fieldName] = fieldValue ?? null;
      }
    });

    // Update form state
    this.formStateService.updateFormData(formData);

    return formData;
  }

  handleEditRow(rowData: any, formControls: { formConfig: IFormControl, control: FormControl }[], form: FormGroup): void {
    formControls.forEach((control: any) => {
      const { name, type } = control.formConfig;
      if (!form.controls[name]) return;

      const value = rowData[name];

      if (type === 'select' && control.formConfig.payloadKey) {
        this.loadDependentOptions(control, value, rowData);
      }

      this.setFormControlValue(form.controls[name], value);
    });

    // Update form state
    this.formStateService.updateSelectedRow(rowData);
  }

  resetForm(form: FormGroup, formControls: { formConfig: IFormControl, control: FormControl }[]): void {
    form.reset();
    formControls?.forEach((control: any) => {
      if (control.formConfig?.defaultValue) {
        control.control.setValue(control.formConfig.defaultValue?.Id);
      }
    });

    // Reset form state
    this.formStateService.resetState();
  }

  loadDependentOptions(control: any, value: any, rowData: any): void {
    const service = this.serviceRegistry.getService(control.formConfig.apiService);
    const apiMethod = control.formConfig.apiMethod;
    const dependsOnValue = rowData[control.formConfig.dependsOn || ''];
    const payloadValue = typeof dependsOnValue === 'object' ? dependsOnValue?.value : dependsOnValue;

    const payload = {
      [control.formConfig.payloadKey || 'id']: payloadValue
    };

    service?.[apiMethod]?.(payload).subscribe((data: any) => {
      const labelKey = control.formConfig.labelKey || 'label';
      const valueKey = control.formConfig.valueKey || 'value';
      control.formConfig.options = data.ResponseValue.map((item: any) => ({
        label: item[labelKey],
        value: item[valueKey]
      }));
    });
  }

  private setupAutoFormat(config: IFormControl): void {
    if (config.autoFormat) {
      const precision = config.autoFormat.decimalPrecision ?? this.configService.getDecimalPrecision();
      config.autoFormat = {
        ...config.autoFormat,
        decimalPrecision: precision
      };
    }
  }

  private setFormControlValue(control: AbstractControl, value: any): void {
    if (value !== undefined && value !== null) {
      control.setValue(value);
    }
  }
} 