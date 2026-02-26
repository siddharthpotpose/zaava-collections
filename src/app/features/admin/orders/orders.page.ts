import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css'
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);

  readonly orders$ = this.orderService.getOrders().pipe(
    map((orders) =>
      [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    )
  );

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    this.orderService.updateOrderStatus(orderId, status);
  }
}
