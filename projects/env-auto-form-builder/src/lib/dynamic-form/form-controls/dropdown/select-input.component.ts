import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-select-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './select-input.component.html'
})
export class SelectInputComponent {
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl('');
  @Input() options: any[] = [];
}
