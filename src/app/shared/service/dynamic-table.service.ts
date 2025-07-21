import { Injectable } from '@angular/core';
import { ServiceRegistryService } from './service-registry.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicTableService {

  constructor(
    private serviceRegistry: ServiceRegistryService
  ) { }

  async populateTableData(dataArray: any[], formControls: any[]): Promise<any[]> {
      const updatedDataArray = await Promise.all(
        dataArray.map(async (data) => {
          for (const control of formControls) {
            const { type, name, autoComplete, options, apiService, apiMethod, dependsOn, payloadKey, labelKey, valueKey } = control.formConfig;
  
            if ((type === 'select') && name in data) {
              let selected = data[name];
              if (selected && typeof selected === 'object') {
                selected = selected.value;
              }
  
              // For dependent dropdowns: fetch options if not present
              if ((!options || options.length === 0) && apiService && apiMethod && dependsOn) {
                const dependsOnValue = data[dependsOn];
                const payload = { [payloadKey || 'id']: dependsOnValue?.value || dependsOnValue };
  
                const service = this.serviceRegistry.getService(apiService);
                if (service && typeof service[apiMethod] === 'function') {
                  const response = await service[apiMethod](payload).toPromise();
                  const resultOptions = response?.ResponseValue?.map((item: any) => ({
                    label: item[labelKey || 'label'],
                    value: item[valueKey || 'value']
                  })) || [];
                  control.formConfig.options = resultOptions;
                }
              }

              // for not dependent dropdowns: fetch options if not present
              else if ((!options || options.length === 0) && apiService && apiMethod) {
                const service = this.serviceRegistry.getService(apiService);
                if (service && typeof service[apiMethod] === 'function') {
                  const response = await service[apiMethod]().toPromise();
                  const resultOptions = response?.ResponseValue?.map((item: any) => ({
                    label: item[labelKey || 'label'],
                    value: item[valueKey || 'value']
                  })) || [];
                  control.formConfig.options = resultOptions;
                }
              }
  
              control.formConfig.options = control.formConfig.options?.map((item: any) => ({
                label: item[labelKey] || item.label,
                value: item[valueKey] || item.value
              }));

              const matchedOption = control.formConfig.options?.find((opt: any) => opt.value === selected);
              if (matchedOption) {
                data[name] = matchedOption;
              }
            }
  
            if (autoComplete && name in data) {
              let selected = data[name];
              if (apiService && apiMethod) {
                const requestBody = [
                  {
                    id: selected,
                    name: "",
                    masterName: "City"
                  }
                ];
                const service = this.serviceRegistry.getService(apiService);
                service[apiMethod](requestBody).subscribe({
                  next: (response: any) => {
                    if (response) {
                      response = response?.map((item: any) => ({
                        CityMasterId: item.id,
                        City: item.name
                      }));
                      if (labelKey && valueKey) {
                        control.formConfig.options = response.filter((r: any) => r[valueKey] == selected);
                        control.formConfig.options = control.formConfig.options?.map((item: any) => ({
                          label: item[labelKey],
                          value: item[valueKey]
                        }));
                        const matchedOption = control.formConfig.options?.find((opt: any) => opt.value === selected);
                        if (matchedOption) {
                          data[name] = matchedOption;
                        }
                      }
                    }
                  }
                });
              }
            }
          }
  
          return data;
        })
      );
  
      return updatedDataArray;
    }
}
