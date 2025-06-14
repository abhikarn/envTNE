import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IFormControl } from '../../form-control.interface';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormControlFactory } from '../../form-control.factory';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { BaseFormControlComponent } from '../base-form-control.component';
import { ServiceRegistryService } from '../../../service/service-registry.service';
import { SnackbarService } from '../../../service/snackbar.service';
import { GlobalConfigService } from '../../../service/global-config.service';

@Component({
  selector: 'lib-text-area-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FunctionWrapperPipe
  ],
  templateUrl: './text-area-input.component.html',
  styleUrls: ['./text-area-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextAreaInputComponent extends BaseFormControlComponent {
  @Input() override control: FormControl = new FormControl(null);
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

  override getErrorMessage(): string {
    return super.getErrorMessage();
  }
}
