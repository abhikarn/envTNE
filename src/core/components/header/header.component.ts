import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { AuthService } from '../../../app/shared/service/auth.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MobileProfileComponent } from './mobile-profile/mobile-profile.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CoreModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  displayCode:string=''
  displayName:string=''
  profileMenuVisible = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private bottomSheet: MatBottomSheet
  ) { }

  toggleProfileMenu(): void {
    this.profileMenuVisible = !this.profileMenuVisible;
  }

  Logout(): void {
    localStorage.removeItem('userData');
    this.router.navigate(['/account']); // Adjust route as needed
  }

  ngOnInit(): void {
    this.displayCode=this.auth.getUserDisplayCode()
    this.displayName=this.auth.getUserDisplayName()
  }

  openProfileBottomSheet(): void {
    this.bottomSheet.open(MobileProfileComponent, {
      data: {
        displayCode: this.displayCode,
        displayName: this.displayName
      }
    });
  }
}
