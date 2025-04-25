import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CoreModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  footerText: string = "Copyright © 2024-2025. All rights reserved.";
  submitted = false;
  sessionId: string = ''
  isAuthenticated: boolean = false
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      employeeCode: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      employeeCode: this.loginForm.value.employeeCode,
      password: this.loginForm.value.password,
      ipAddress: "10.52.556.56",
      browser: "chrome"
    };

    this.http.post('https://localhost:7073/api/Account/EmployeeAuth', payload).subscribe({
      next: (response: any) => {
        const result = response.responseValue;
        if (result.isAuthenticated) {
          this.sessionId = result.sessionId;

          this.http.post('https://localhost:7073/api/Account/GetUserData', {
            sessionId: this.sessionId
          }).subscribe({
            next: (userDataResponse: any) => {
              localStorage.setItem('sessionId', this.sessionId);
              localStorage.setItem('userData', JSON.stringify(userDataResponse));
              localStorage.setItem('userMasterId',userDataResponse.token.userMasterId);
              console.log(userDataResponse);
              this.router.navigate(['/expense/expense/dashboard']);
            },
            error: () => {
              this.errorMessage = 'Unable to retrieve user data.';
            }
          });
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      },
      error: () => {
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    });
  }
}
