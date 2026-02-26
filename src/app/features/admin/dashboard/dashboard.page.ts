import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { BannerService } from '../../../core/services/banner.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly bannerService = inject(BannerService);

  readonly products$ = this.productService.getProducts();
  readonly orders$ = this.orderService.getOrders();
  readonly categories$ = this.categoryService.getCategories();
  readonly banners$ = this.bannerService.getBanners();

  readonly stats$ = combineLatest([
    this.products$,
    this.orders$,
    this.categories$,
    this.banners$
  ]).pipe(
    map(([products, orders, categories, banners]) => {
      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        products: products.length,
        orders: orders.length,
        categories: categories.length,
        banners: banners.length,
        revenue
      };
    })
  );
}
