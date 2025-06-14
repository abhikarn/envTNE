import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { Observable, of } from 'rxjs';
import { FormControlFactory } from '../../form-control.factory';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';

@Component({
  selector: 'lib-radio-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    FunctionWrapperPipe
  ],
  templateUrl: './radio-input.component.html',
  styleUrls: ['./radio-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioInputComponent),
      multi: true,
    },
  ],
})
export class RadioInputComponent extends BaseFormControlComponent {
  @Input() override control: FormControl = new FormControl('');
  @Input() override controlConfig: IFormControl = { name: '' };
  @Input() override form: FormGroup = new FormGroup({});

  constructor(
    protected override serviceRegistry: ServiceRegistryService,
    protected override snackbarService: SnackbarService,
    protected override configService: GlobalConfigService
  ) {
    super(serviceRegistry, snackbarService, configService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override trackByFn(index: number, item: any): string | number {
    return item.value;
  }

  override getErrorMessage(): string {
    return super.getErrorMessage();
  }
}
