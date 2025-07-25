import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { IFormControl } from '../../form-control.interface';
import { GlobalConfigService } from '../../../service/global-config.service';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';

@Component({
  selector: 'lib-text-autocomplete',
  imports: [CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatOptionModule,
    FunctionWrapperPipe, MatIconModule],
  templateUrl: './text-autocomplete.component.html',
  styleUrls: ['./text-autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextAutocompleteComponent {

  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private snackbarService: SnackbarService,
    private configService: GlobalConfigService
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    this.control.valueChanges.subscribe(inputValue => {
      if (typeof inputValue === 'string') {
        this.onInputChange(inputValue);
      }
      console.log(this.form);
    });
  }

  displayFn = (value: any): string => {
    if (typeof value === 'object') return value?.label ?? '';

    const matched = this.controlConfig.options?.find(opt => opt.value === value);
    return matched?.label ?? this.form.get(this.controlConfig?.setNameControl)?.value ?? '' ;
  };



  trackByFn(index: number, item: any): string | number {
    return item?.Key ?? index;
  }

  onInputChange(inputValue: string) {
    if (this.controlConfig.autoComplete && this.controlConfig.apiService && this.controlConfig.apiMethod) {
      const service = this.serviceRegistry.getService(this.controlConfig.apiService);
      if (service) {
        const request = { SearchText: inputValue ?? '' };

        service[this.controlConfig.apiMethod](request).subscribe((response: any) => {
          console.log('API response:', response); // <-- Check this in browser dev tools

          const items = response?.ResponseValue ?? [];

          const labelKey = this.controlConfig.labelKey ?? 'label';
          const valueKey = this.controlConfig.valueKey ?? 'value';

          if (Array.isArray(items)) {
            this.controlConfig.options = items.map(item => ({
              label: item[labelKey],
              value: item[valueKey],
              ...item
            }));
          } else {
            this.controlConfig.options = [];
            console.warn('Expected array from API, got:', items);
          }
        });

      }
    }
  }

  onOptionSelected(event: any) {
    const selectedOption = event.option.value;
    console.log('Selected option:', selectedOption);
    this.control.setValue(selectedOption.value);
  }


  getErrorMessage(): string {
    if (this.control.hasError('required')) {
      return `${this.controlConfig.label} is required`;
    }
    return '';
  }
}
