import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  readonly orders$ = this.orderService.getOrders();
}
