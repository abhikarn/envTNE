import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, Injector, Type, inject, signal, computed, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFormControl, FormControlType } from './form-control.interface';
import { ServiceRegistryService } from '../service/service-registry.service';
import { SnackbarService } from '../service/snackbar.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  template: ''
})
export class DynamicFormBaseComponent implements OnInit, OnChanges {
  @Input({ required: true }) formConfig!: IFormControl[];
  @Input({ required: true }) category!: any;
  @Input() moduleData?: any;
  @Input() eventHandler?: any;
  @Input() minSelectableDate?: Date;
  @Input() maxSelectableDate?: Date;
  @Input() existingData?: any;
  @Input() referenceId = 0;
  @Input() isEdit = false;
  @Input() rowData?: any;

  @Output() emitFormData = new EventEmitter<any>();
  @Output() emitTextData = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();
  @Output() formSubmit = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  formData = signal<any>({});
  isValid = signal<boolean>(true);
  tableData = signal<any[]>([]);
  formValue = signal<any>({});
  isFormDirty = computed(() => this.form.dirty);
  isLoadingOptions = signal<boolean>(false);
  options = signal<any[]>([]);
  editIndex = 0;
 private destroyRef = inject(DestroyRef);

  constructor(
    protected serviceRegistry: ServiceRegistryService,
    protected snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupFormSubscriptions();
    if (this.isEdit && this.rowData) {
      this.handleEditRow(this.rowData);
    }
    this.formValue.set(this.form.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formConfig'] && !changes['formConfig'].firstChange) {
      this.initializeForm();
    }
  }

  protected initializeForm(): void {
    this.formControls = [];
    this.form = new FormGroup({});
    this.formConfig.forEach(config => {
      const control = new FormControl(null, this.getValidators(config));
      this.formControls.push({ formConfig: config, control: control });
      this.form.addControl(config.name, control);

      if (config.apiService && config.apiMethod) {
        this.loadOptions(config);
      }
    });
  }

  protected setupFormSubscriptions(): void {
    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(values => {
        this.handleFormValueChanges(values);
        this.formValue.set(values);
      });

    this.form.statusChanges
      .pipe(
         takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(status => {
        this.handleFormStatusChanges(status);
      });
  }

  protected handleFormValueChanges(values: any): void {
    // Override in derived classes
  }

  protected handleFormStatusChanges(status: string): void {
    this.isValid.set(status === 'VALID');
  }

  protected handleEditRow(rowData: any): void {
    // Override in derived classes
  }

  protected getValidators(config: IFormControl): any[] {
    const validators = [];
    if (config.required) {
      validators.push(Validators.required);
    }
    if (config.minLength) {
      validators.push(Validators.minLength(config.minLength));
    }
    if (config.maxLength) {
      validators.push(Validators.maxLength(config.maxLength));
    }
    if (config.pattern) {
      validators.push(Validators.pattern(config.pattern));
    }
    return validators;
  }

  protected loadOptions(control: IFormControl) {
    this.isLoadingOptions.set(true);
    if (!control.apiService || !control.apiMethod) {
      this.isLoadingOptions.set(false);
      return;
    }
    const service = this.serviceRegistry.getService(control.apiService);
    if (service && typeof service[control.apiMethod] === 'function') {
      service[control.apiMethod]()
        .pipe( takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: any) => {
            if (response && Array.isArray(response)) {
              this.options.set(response);
            }
            this.isLoadingOptions.set(false);
          },
          error: (error: Error) => {
            console.error(`Error loading options for ${control.name}:`, error);
            this.snackbarService.error(`Failed to load options for ${control.label}`);
            this.isLoadingOptions.set(false);
          }
        });
    } else {
      this.isLoadingOptions.set(false);
    }
  }

  protected prepareFormJson() {
    const data: { name: string; data: { ReferenceId: number; excludedData: Record<string, any>; [key: string]: any } } = {
      name: this.category.name,
      data: { ReferenceId: this.referenceId, excludedData: {} }
    };
    this.formControls.forEach(control => {
      const type = control.formConfig.type;
      const fieldName = control.formConfig.name;
      let fieldValue = this.form.value[fieldName];

      control.formConfig.value = fieldValue;
      if (control.formConfig.isExcluded) {
        data.data.excludedData[fieldName] = fieldValue ?? null;
      } else {
        data.data[fieldName] = fieldValue ?? null;
      }
    });
    this.formData.set(data);
    this.emitFormData.emit({
      formData: this.formData(),
      editIndex: this.editIndex - 1
    });
    this.formData.set({});
  }

  protected clear() {
    this.form.reset();
    this.formValue.set({});
  }

  protected onSubmit() {
    if (this.form.valid) {
      this.prepareFormJson();
      this.formSubmit.emit(this.form.value);
    }
  }
}