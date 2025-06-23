import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';

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
export class MultiSelectInputComponent extends BaseFormControlComponent {
  @Input() override control: FormControl = new FormControl([]);
  @Input() override controlConfig: IFormControl = {name: ''};
  @Input() override form: FormGroup = new FormGroup({});

  @ViewChild('select') select!: MatSelect;

  searchTerm = '';
  allSelected = false;
  allOptions: any[] = [];
  filteredOptions: any[] = [];

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService
  ) {
    super(serviceRegistry, snackbarService, configService);
  }

  override ngOnInit() {
    super.ngOnInit();
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

  override getErrorMessage(): string {
    return super.getErrorMessage();
  }
}
