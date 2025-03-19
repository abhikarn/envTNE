import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';

@Component({
  selector: 'lib-multi-select-input',
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
  templateUrl: './multi-select-input.component.html'
})
export class MultiSelectInputComponent {
  @Input() control!: FormControl;
  @Input() controlConfig: IFormControl = {name: ''};

  @ViewChild('select') select!: MatSelect;

  searchTerm = '';
  allSelected = false;
  allOptions: any[] = [];
  filteredOptions: any[] = [];

  ngOnInit() {
    this.allOptions = this.controlConfig?.options || [];
    this.filteredOptions = [...this.allOptions];
  }

  filterOptions() {
    this.filteredOptions = this.allOptions.filter(option =>
      option.Value.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  resetSearch() {
    this.searchTerm = '';
    this.filterOptions();
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.control.setValue(this.allSelected ? this.allOptions.map(o => o.Key) : []);
  }

  isSelected(value: any): boolean {
    return this.control.value?.includes(value);
  }

  getErrorMessage(): string {
    if (!this.controlConfig?.validations) return '';
  
    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }
  
    return 'Invalid selection'; // Default fallback message
  }
}
