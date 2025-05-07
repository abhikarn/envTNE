import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon'; // Optional, for future use
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-landing',
  imports: [MatCardModule, MatGridListModule, MatGridListModule, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  expenses: any[] = [];
  constructor(private router: Router,private http: HttpClient) { }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  ngOnInit(): void {
    this.loadExpenseConfig();
  }

  loadExpenseConfig(): void {
    
    this.http.get<any[]>('assets/config/expense-type-config.json')
      .subscribe({
        next: (data) => this.expenses = data,
        error: (err) => console.error('Failed to load expense config', err)
      });
  }

}
