import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ORDERS } from '../data/orders.data';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  getOrders(): Observable<Order[]> {
    return of(ORDERS);
  }
}
