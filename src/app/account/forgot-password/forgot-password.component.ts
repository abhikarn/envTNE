

import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { NewExpenseService } from '../../feature/expense/service/new-expense.service';
import * as loginConfig from '../../../assets/config/login-config.json';
import { IFormControl } from '../../shared/dynamic-form/form-control.interface';
import { FormControlFactory } from '../../shared/dynamic-form/form-control.factory';
import { MatTabsModule } from '@angular/material/tabs';
import { TextInputComponent } from '../../shared/dynamic-form/form-controls/input-control/text-input.component';
import { SelectInputComponent } from '../../shared/dynamic-form/form-controls/dropdown/select-input.component';
import { TextAreaInputComponent } from '../../shared/dynamic-form/form-controls/text-area/text-area-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AccountService, ForgotPasswordParam } from '../../../../tne-api';
import { SnackbarService } from '../../shared/service/snackbar.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CoreModule, RouterModule, CommonModule,
    // ExpansionPanelComponent,
    // MaterialTableComponent,
    // SummaryComponent,
    MatTabsModule,
    ReactiveFormsModule,
    TextInputComponent,
    SelectInputComponent,
    TextAreaInputComponent,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule],

  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  loginForm!: FormGroup;
  footerText: string = "Copyright © 2024-2025. All rights reserved.";
  submitted = false;
  sessionId: string = '';
  isAuthenticated: boolean = false;
  errorMessage = '';
  config: any = loginConfig.ForgotPasswordForm;
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  form: FormGroup = new FormGroup({});
  loginFormControl: any = this.config.loginForm;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private newExpenseService: NewExpenseService,
    private accountService: AccountService,
    private snackbarService: SnackbarService,
  ) { }

  ngOnInit(): void {
    this.renderer.setStyle(
      document.documentElement,
      '--login-page-bg',
      this.config.styles.loginPageBackgroundColor
    );

    this.createForm();
  }

  onSubmit(): void {

    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;

    }

    this.getIPAddress().then((ipAddress) => {
      let payload: ForgotPasswordParam = {
        Email: this.form.get('Email')?.value,
        Otp: this.form.get('Otp')?.value,
      }

      this.accountService.accountForgotPassword(payload).subscribe({
        next: (response: any) => {
          if (response.ResponseValue.Result == "FAILED") {
            this.snackbarService.error(response.ResponseValue.Message);
          }
          else if (response.ResponseValue.Result == "SUCCESS") {
            this.snackbarService.success(response.ResponseValue.Message);
          }
        },
        error: () => {
          this.errorMessage = 'Invalid credentials. Please try again.';
        },
      });
    });
  }

  private async getIPAddress(): Promise<string> {
    try {
      const response = await this.http.get<{ ip: string }>('https://api.ipify.org?format=json').toPromise();
      return response?.ip || '0.0.0.0';
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return '0.0.0.0';
    }
  }

  createForm() {

    const tabIndex = "login";
    const tabLabel = this.loginFormControl.name;
    if (tabLabel == 'LoginForm') {
      // Set Login Form
      this.formControls = []; // Reset to avoid duplication
      this.form = new FormGroup({});
      if (this.loginFormControl) {
        if (this.loginFormControl?.name == 'LoginForm') {
          this.loginFormControl?.formControls?.forEach((config: any) => {
            const control = FormControlFactory.createControl(config);
            this.formControls.push({ formConfig: config, control: control });
            this.form.addControl(config.name, control);
          });
        }
      }
      console.log(this.form);
    } else {
      this.formControls = []; // Reset to avoid duplication
      this.form = new FormGroup({});
    }
  }
}
