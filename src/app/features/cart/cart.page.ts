import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CartItem } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.css'
})
export class CartPage {
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly whatsappNumber = '918485896373';

  readonly cartItems$ = this.cartService.getCartItems();
  readonly totalAmount$ = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.product.price * item.quantity, 0))
  );
  cartItemsSnapshot: CartItem[] = [];
  totalAmountSnapshot = 0;

  isOrderPopupOpen = false;
  isOrderPlaced = false;
  orderError = '';
  customerDetails = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    note: ''
  };

  constructor() {
    this.cartItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.cartItemsSnapshot = items;
        this.totalAmountSnapshot = items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      });
  }

  increase(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1, item.selectedSize);
  }

  decrease(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize);
  }

  remove(item: CartItem): void {
    this.cartService.removeItem(item.product.id, item.selectedSize);
  }

  openOrderPopup(): void {
    if (!this.cartItemsSnapshot.length) {
      return;
    }

    this.orderError = '';
    this.isOrderPlaced = false;
    this.isOrderPopupOpen = true;
  }

  closeOrderPopup(): void {
    this.orderError = '';
    this.isOrderPopupOpen = false;
    this.isOrderPlaced = false;
  }

  placeOrderOnWhatsApp(): void {
    if (!this.isCustomerDetailsValid()) {
      this.orderError = 'Please fill your name, phone and address correctly.';
      return;
    }

    const orderMessage = this.buildWhatsAppMessage();
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
    const newWindow = window.open(url, '_blank');

    if (!newWindow) {
      this.orderError = 'Please allow popups to continue on WhatsApp.';
      return;
    }

    this.orderError = '';
    this.isOrderPlaced = true;
    this.cartService.clearCart();
  }

  private isCustomerDetailsValid(): boolean {
    const phoneDigits = this.customerDetails.phone.replace(/\D/g, '');

    return (
      this.customerDetails.name.trim().length >= 2 &&
      phoneDigits.length >= 10 &&
      this.customerDetails.address.trim().length >= 8
    );
  }

  private buildWhatsAppMessage(): string {
    const orderId = `ZAAVA-${Date.now()}`;
    const customerBlock = [
      `Order ID: ${orderId}`,
      `Customer Name: ${this.customerDetails.name}`,
      `Phone: ${this.customerDetails.phone}`,
      `Email: ${this.customerDetails.email || 'Not provided'}`,
      `Address: ${this.customerDetails.address}`,
      `City: ${this.customerDetails.city || 'Not provided'}`,
      `Note: ${this.customerDetails.note || 'No note'}`
    ].join('\n');

    const itemsBlock = this.cartItemsSnapshot
      .map((item, index) => {
        const lineTotal = item.product.price * item.quantity;
        return [
          `${index + 1}. ${item.product.title}`,
          `   Size: ${item.selectedSize || 'Standard'}`,
          `   Qty: ${item.quantity}`,
          `   Price: INR ${item.product.price}`,
          `   Subtotal: INR ${lineTotal}`,
          `   Image: ${item.product.images[0]}`
        ].join('\n');
      })
      .join('\n\n');

    return [
      'Hello Zaava Team,',
      '',
      'A new order has been placed successfully. Please contact the customer shortly.',
      '',
      'Customer Details:',
      customerBlock,
      '',
      'Ordered Products:',
      itemsBlock,
      '',
      `Total Amount: INR ${this.totalAmountSnapshot}`
    ].join('\n');
  }
}
