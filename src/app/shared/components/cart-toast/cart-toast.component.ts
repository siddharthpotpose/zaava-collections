import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

@Component({
  selector: 'app-cart-toast',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-toast.component.html',
  styleUrl: './cart-toast.component.css'
})
export class CartToastComponent {
  private readonly toastService = inject(ToastNotificationService);
  readonly toast$ = this.toastService.toast$;

  dismiss(): void {
    this.toastService.dismiss();
  }
}
