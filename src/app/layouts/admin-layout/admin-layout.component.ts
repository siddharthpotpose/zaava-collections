import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  isRouteTransitioning = false;

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.isRouteTransitioning = event instanceof NavigationStart;
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      return;
    }

    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  logout(): void {
    this.authService.logoutAdmin();
    this.router.navigate(['/']);
  }
}
