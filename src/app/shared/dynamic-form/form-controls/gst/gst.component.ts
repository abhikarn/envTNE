import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IFormControl } from '../../form-control.interface';
import { SnackbarService } from '../../../service/snackbar.service';
import { AddGstComponent } from './add-gst/add-gst.component';

@Component({
  selector: 'app-gst',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    AddGstComponent
  ],
  templateUrl: './gst.component.html'
})
export class GstComponent implements AfterViewInit, AfterViewChecked {  
  @ViewChild(AddGstComponent) addGstComponentRef!: AddGstComponent;
  @Input() control: any;
  @Input() controlConfig: IFormControl = { name: '' };
  @Input() form: any;
  gstData: any = [];
  companyGSTForm: FormGroup;
  options = [
    {
      "label": "Yes",
      "value": true
    },
    {
      "label": "No",
      "value": false
    }
  ]

  private pendingGstDetails: any = null;

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService
  ) {
    this.companyGSTForm = this.fb.group({
      IsBillRaisedInCompanyGST: [false, Validators.required]
    });
  }

  ngOnInit() {
    
    console.log(localStorage.getItem('ocrResult'));
    if (localStorage.getItem('ocrResult') === 'true') {
      this.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(true);
    }
  }

  trackByFn(index: number): any {
    return index;
  }

  setCompanyGSTFlag(value: boolean): void {
    this.companyGSTForm.get('IsBillRaisedInCompanyGST')?.setValue(value);
  }

  setGstDetailsFromOcr(gstDetails: any) {
    
    this.gstData = gstDetails;
    this.pendingGstDetails = gstDetails;
    // Try to set immediately if child is available
    if (this.addGstComponentRef) {
       
      this.addGstComponentRef.setGstDetails(gstDetails);
      this.pendingGstDetails = null;
    }
  }

  ngAfterViewInit() {
    // Set GST details if they were received before child was available
    if (this.pendingGstDetails && this.addGstComponentRef) {
      
      this.addGstComponentRef.setGstDetails(this.pendingGstDetails);
      this.pendingGstDetails = null;
    }
  }

  ngAfterViewChecked() {
    // Defensive: in case child appears after a change
    if (this.pendingGstDetails && this.addGstComponentRef) {
      
      
      this.addGstComponentRef.setGstDetails(this.pendingGstDetails);
      this.pendingGstDetails = null;
    }
  }

}
