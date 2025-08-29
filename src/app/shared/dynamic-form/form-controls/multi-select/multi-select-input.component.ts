import {
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { DynamicFormService } from '../../../service/dynamic-form.service';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-multi-select-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    FunctionWrapperPipe
  ],
  templateUrl: './multi-select-input.component.html',
  styleUrls: ['./multi-select-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MultiSelectInputComponent implements OnInit, OnDestroy {
  @Input() control!: FormControl;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  @Output() valueChange = new EventEmitter<{ event: any; control: IFormControl }>();

  @ViewChild('select') select!: MatSelect;

  searchTerm = '';
  allSelected = false;
  allOptions: any[] = [];
  filteredOptions: any[] = [];
  apiSubscription?: Subscription;

  constructor(
    private dynamicFormService: DynamicFormService,
    private serviceRegistry: ServiceRegistryService,
  ) {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    this.loadOptions();
    this.control.valueChanges.subscribe(() => {
      this.valueChange.emit({ event: this.control.value, control: this.controlConfig });
      this.updateAllSelectedState();
    });
    if (this.controlConfig.disable) {
      this.control.disable();
    }
  }

  ngOnDestroy() {
    this.apiSubscription?.unsubscribe();
  }

  loadOptions() {
    if (this.controlConfig.options && this.controlConfig.options.length > 0) {
      this.allOptions = this.controlConfig.options;
      this.filteredOptions = [...this.allOptions];
      this.updateAllSelectedState();
      return;
    }
    if ((!this.controlConfig.apiService && !this.controlConfig.apiMethod && (this.controlConfig.options && this.controlConfig.options.length > 0))) return;

    const apiService = this.serviceRegistry.getService(this.controlConfig.apiService || '');
    if (apiService && typeof apiService[this.controlConfig.apiMethod || ''] === 'function') {
      this.apiSubscription = apiService[this.controlConfig.apiMethod || '']().subscribe(
        (data: any) => {
          const labelKey = this.controlConfig.labelKey || 'label';
          const valueKey = this.controlConfig.valueKey || 'value';
          this.controlConfig.options = data.ResponseValue.map((item: any) => ({
            label: item[labelKey] || item.label,
            value: item[valueKey] || item.value
          }));
          this.allOptions = this.controlConfig.options ?? [];
          this.filteredOptions = [...this.allOptions];
          this.updateAllSelectedState();
        },
        (error: any) => {
          console.error('API Error:', error);
        }
      );
    }
  }

  filterOptions() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOptions = this.allOptions.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  }

  resetSearch() {
    this.searchTerm = '';
    this.filterOptions();
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    if (this.controlConfig.setCustomObject) {
      this.form.get(this.controlConfig.setCustomObject.controlName)?.setValue(
        this.allSelected ? this.allOptions.map(o => ({ key: o.label, value: o.value })).join(', ') : []
      );
    }
    this.control.setValue(this.allSelected ? this.allOptions.map(o => o.value) : []);
    this.form.get(this.controlConfig.getReadableValue.controlName)?.setValue(
      this.allSelected ? this.allOptions.map(o => o.label).join(', ') : []
    );
  }

  isSelected(value: any): boolean {
    const rawValue = this.control.value;
    const values: any[] = Array.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];

    if (this.controlConfig.setCustomObject) {
      this.form.get(this.controlConfig.setCustomObject.controlName)?.setValue(
        values.map(v => ({
          key: this.allOptions.find(o => o.value === v)?.label,
          value: v
        }))
      );
    }

    this.form.get(this.controlConfig.getReadableValue.controlName)?.setValue(
      values.map(v => this.allOptions.find(o => o.value === v)?.label).join(', ')
    );

    return values.includes(value);
  }

  updateAllSelectedState() {
    const selectedValues = this.control.value || [];
    this.allSelected = selectedValues.length > 0 &&
      this.allOptions.every(o => selectedValues.includes(o.value));
  }

  getErrorMessage(): string {
    if (!this.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection';
  }
}
