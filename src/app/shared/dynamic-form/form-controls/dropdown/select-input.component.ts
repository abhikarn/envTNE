import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IFormControl } from '../../form-control.interface';


@Component({
  selector: 'lib-select-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './select-input.component.html'
})
export class SelectInputComponent {
  @Input() control: FormControl = new FormControl('');
  @Input() controlConfig?: IFormControl;

}
