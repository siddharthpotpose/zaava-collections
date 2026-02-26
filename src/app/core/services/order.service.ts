import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ORDERS } from '../data/orders.data';
import { Order, OrderStatus } from '../models/order.model';

export interface CreateOrderPayload {
  userName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  note?: string;
  products: Order['products'];
  totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly storageKey = 'zaava_orders';
  private readonly ordersSubject = new BehaviorSubject<Order[]>(this.restoreOrders());

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrdersSnapshot(): Order[] {
    return this.ordersSubject.getValue();
  }

  getNextOrderId(): number {
    const ids = this.ordersSubject.getValue().map((order) => order.id);
    return (Math.max(...ids, 1000) || 1000) + 1;
  }

  createOrder(payload: CreateOrderPayload, preferredId?: number): Order {
    const nextId = preferredId ?? this.getNextOrderId();
    const order: Order = {
      id: nextId,
      userName: payload.userName.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim() || 'Not provided',
      address: payload.address.trim(),
      city: payload.city?.trim() || '',
      note: payload.note?.trim() || '',
      products: payload.products,
      totalAmount: payload.totalAmount,
      orderDate: new Date().toISOString(),
      status: 'Pending'
    };

    const next = [order, ...this.ordersSubject.getValue()];
    this.ordersSubject.next(next);
    this.persistOrders(next);

    return order;
  }

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    const next = this.ordersSubject
      .getValue()
      .map((order) => (order.id === orderId ? { ...order, status } : order));

    this.ordersSubject.next(next);
    this.persistOrders(next);
  }

  private restoreOrders(): Order[] {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return [...ORDERS];
      }

      const parsed = JSON.parse(raw) as Order[];

      if (!Array.isArray(parsed)) {
        return [...ORDERS];
      }

      return parsed;
    } catch {
      return [...ORDERS];
    }
  }

  private persistOrders(orders: Order[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
    } catch {
      // Ignore storage errors to keep order flow functional.
    }
  }
}
