import {
  Component,
  forwardRef,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';
import { IFormControl } from '../../form-control.interface';

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
export class RadioInputComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };

  constructor() {
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    // Disable control if configured
    if (this.controlConfig.disable) {
      this.control.disable();
    }

    // Set default value from config if form control doesn't already have one
    if (
      this.controlConfig.value !== undefined &&
      (this.control.value === null || this.control.value === undefined)
    ) {
      this.control.setValue(this.controlConfig.value);
    }
  }

  trackByFn(index: number, item: any): any {
    return item.value;
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
