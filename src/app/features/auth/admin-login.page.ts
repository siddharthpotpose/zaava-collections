import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.page.html',
  styleUrl: './admin-login.page.css'
})
export class AdminLoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginError = '';

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.authService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isSuccess = this.authService.loginAsAdmin({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? ''
    });

    if (!isSuccess) {
      this.loginError = 'Invalid admin credentials.';
      return;
    }

    this.loginError = '';
    this.router.navigate(['/admin/dashboard']);
  }
}
