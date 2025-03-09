import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './text-input.component.html'
})
export class TextInputComponent {
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl('');
}
