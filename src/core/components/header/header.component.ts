import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CoreModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router) { }

  Logout(): void {
    debugger;
    localStorage.removeItem('userData');
    this.router.navigate(['/account']); // Adjust route as needed
  }
}
