import { Component, HostListener } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../app/shared/service/auth.service';

@Component({
  selector: 'app-side-menu',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  displayCode: string = '';
  displayName: string = '';
  profileMenuVisible = false;

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedInsideMenu = target.closest('#profileMenu');
    const clickedToggleButton = target.closest('#profileToggle');

    if (!clickedInsideMenu && !clickedToggleButton) {
      this.profileMenuVisible = false;
    }
  }

  toggleSideBar(): void {
    const body = document.querySelector('body');
    if (body) {
      body.classList.toggle('sidebar-collapse');
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuVisible = !this.profileMenuVisible;
  }

  Logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userMasterId');
    localStorage.removeItem('token');
    this.router.navigate(['/account']); // Adjust route as needed
  }

  ngOnInit(): void {
    this.displayCode = this.auth.getUserDisplayCode();
    this.displayName = this.auth.getUserDisplayName();
  }

}
