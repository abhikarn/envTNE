import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { NewExpenseService } from '../../feature/expense/service/new-expense.service';
// import * as loginConfig from '../../../assets/config/login-config.json';
import { IFormControl } from '../../shared/dynamic-form/form-control.interface';
import { FormControlFactory } from '../../shared/dynamic-form/form-control.factory';
import { MatTabsModule } from '@angular/material/tabs';
import { TextInputComponent } from '../../shared/dynamic-form/form-controls/input-control/text-input.component';
import { SelectInputComponent } from '../../shared/dynamic-form/form-controls/dropdown/select-input.component';
import { TextAreaInputComponent } from '../../shared/dynamic-form/form-controls/text-area/text-area-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environment';

@Component({
  selector: 'app-login',
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

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  assetPath = `${environment.assetsPath}`
  loginForm!: FormGroup;
  footerText: string = "Copyright © 2024-2025. All rights reserved.";
  submitted = false;
  sessionId: string = '';
  isAuthenticated: boolean = false;
  errorMessage = '';
  formControls: { formConfig: IFormControl, control: FormControl }[] = [];
  form: FormGroup = new FormGroup({});
  loginConfig: any;
  config: any;
  loginFormControl: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private newExpenseService: NewExpenseService
  ) { }

  ngOnInit(): void {
    // this.loginConfig=this.http.get<any>(`${this.assetPath}/assets/config/login-config.json`);
    // this.config = this.loginConfig.loginForm;
    // this.loginFormControl = this.loginConfig.loginForm;
    // this.renderer.setStyle(
    //   document.documentElement,
    //   '--login-page-bg',
    //   this.config.styles.loginPageBackgroundColor
    // ); 
    // this.createForm();
    this.http.get<any>(`${this.assetPath}/assets/config/login-config.json`).subscribe({
      next: (configData) => {
        this.loginConfig = configData;
        this.config = configData.LoginForm;
        this.loginFormControl = configData.LoginForm.loginForm;

        this.renderer.setStyle(
          document.documentElement,
          '--login-page-bg',
          this.config.styles?.loginPageBackgroundColor || '#ffffff'
        );

        this.createForm();
      },
      error: (err) => {
        console.error('Failed to load login config:', err);
        this.errorMessage = 'Unable to load configuration. Please contact support.';
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.getIPAddress().then((ipAddress) => {
      const payload = {
        employeeCode: this.form.value.employeeCode,
        password: this.form.value.password,
        ipAddress: ipAddress,
        browser: "chrome",
      };

      this.newExpenseService.EmployeeAuth(payload).subscribe({
        next: (response: any) => {
          const result = response.responseValue;
          if (result.isAuthenticated) {
            this.sessionId = result.sessionId;
            this.newExpenseService.GetUserData({
              sessionId: this.sessionId,
            }).subscribe({
              next: (userDataResponse: any) => {
                console.log('LoginComponent: GetUserData response', userDataResponse);
                localStorage.setItem('sessionId', this.sessionId);
                localStorage.setItem('userData', JSON.stringify(userDataResponse));
                localStorage.setItem('userMasterId', userDataResponse.token.userMasterId);
                console.log(userDataResponse);
                this.router.navigate(['/dashboard']);
              },
              error: () => {
                this.errorMessage = 'Unable to retrieve user data.';
              },
            });
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
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
