import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { AuthService } from '../../../app/shared/service/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CoreModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  displayCode:string=''
  displayName:string=''
  constructor(private router: Router,
    private auth:AuthService
  ) { }

  ngOnInit(): void {
    this.displayCode=this.auth.getUserDisplayCode()
    this.displayName=this.auth.getUserDisplayName()
  }
  
}
