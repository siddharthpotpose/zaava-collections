import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

  readonly cartItems$ = this.cartItemsSubject.asObservable();

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  addToCart(product: Product, quantity = 1, selectedSize?: string): void {
    const current = this.cartItemsSubject.getValue();
    const found = current.find(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize
    );

    if (found) {
      found.quantity += quantity;
      this.cartItemsSubject.next([...current]);
      return;
    }

    this.cartItemsSubject.next([...current, { product, quantity, selectedSize }]);
  }

  updateQuantity(productId: number, quantity: number, selectedSize?: string): void {
    const next = this.cartItemsSubject.getValue().map((item) => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity: Math.max(1, quantity) };
      }

      return item;
    });

    this.cartItemsSubject.next(next);
  }

  removeItem(productId: number, selectedSize?: string): void {
    const next = this.cartItemsSubject
      .getValue()
      .filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize));

    this.cartItemsSubject.next(next);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  getTotalAmount(): number {
    return this.cartItemsSubject
      .getValue()
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.cartItemsSubject.getValue().reduce((total, item) => total + item.quantity, 0);
  }
}
