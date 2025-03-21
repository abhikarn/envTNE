import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IFormControl } from '../../form-control.interface';
import { CommonModule } from '@angular/common';
import { catchError, Observable, of, take } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { FormControlFactory } from '../../form-control.factory';
import { FunctionWrapperPipe } from '../../../pipes/functionWrapper.pipe';



@Component({
  selector: 'lib-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
     MatFormFieldModule, MatInputModule, 
     MatAutocompleteModule, MatOptionModule,
    FunctionWrapperPipe],
  templateUrl: './text-input.component.html'
})
export class TextInputComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig: IFormControl = { name: '' };
  options$: Observable<any[]>;

  constructor() {
    this.options$ = !this.controlConfig.option$ ? of([]) : this.controlConfig.option$;
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  ngOnInit() {
    this.control = FormControlFactory.createControl(this.controlConfig);
  }

  getErrorMessage(status: boolean): string {
    console.log('error', status);
    if (!this.controlConfig?.validations) return '';

    for (const validation of this.controlConfig.validations) {
      if (this.control.hasError(validation.type)) {
        return validation.message;
      }
    }

    return 'Invalid selection'; // Default fallback message
  }
}
