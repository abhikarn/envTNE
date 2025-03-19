import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-gst',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './gst.component.html',
  styleUrl: './gst.component.scss'
})
export class GstComponent {
  gstForm: FormGroup;
  gstDetails: any = [];

  constructor(private fb: FormBuilder) {
    this.gstForm = this.fb.group({
      GstIn: ['', Validators.required],
      InvoiceNumber: ['', Validators.required],
      Amount: ['', [Validators.required, Validators.min(0)]],
      SGST: ['', Validators.required],
      CGST: ['', Validators.required],
      IGST: ['', Validators.required],
      UGST: ['', Validators.required]
    });
  }


  addGstRow(): void {
    this.gstDetails.push(this.gstForm.value);
  }

  removeGstRow(index: number): void {
    if (this.gstDetails.length > 1) {
      this.gstDetails.splice(index, 1);
    }
  }
}
