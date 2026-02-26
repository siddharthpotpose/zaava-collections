import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: number;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastNotificationService {
  private readonly toastSubject = new BehaviorSubject<ToastNotification | null>(null);
  readonly toast$ = this.toastSubject.asObservable();

  private dismissTimer?: ReturnType<typeof setTimeout>;

  showAddedToCart(productTitle: string, quantity = 1): void {
    this.show({
      title: 'Added to Cart',
      message: `${productTitle} (${quantity}) was added successfully.`
    });
  }

  show(payload: Omit<ToastNotification, 'id'>): void {
    this.clearTimer();

    this.toastSubject.next({
      id: Date.now(),
      title: payload.title,
      message: payload.message
    });

    this.dismissTimer = setTimeout(() => {
      this.dismiss();
    }, 5000);
  }

  dismiss(): void {
    this.clearTimer();
    this.toastSubject.next(null);
  }

  private clearTimer(): void {
    if (!this.dismissTimer) {
      return;
    }

    clearTimeout(this.dismissTimer);
    this.dismissTimer = undefined;
  }
}
