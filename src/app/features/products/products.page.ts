import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './products.page.html',
  styleUrl: './products.page.css'
})
export class ProductsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastNotificationService);

  readonly categories$ = this.categoryService.getCategories().pipe(
    map((categories) => categories.filter((category) => category.featured))
  );

  readonly filters$ = this.route.queryParamMap.pipe(
    map((params) => ({
      category: params.get('category') ?? '',
      search: (params.get('q') ?? '').toLowerCase()
    }))
  );

  readonly products$ = combineLatest([
    this.productService.getProducts(),
    this.filters$,
    this.categoryService.getCategories()
  ]).pipe(
    map(([products, filters]) => {
      const validCategories = filters.category
        ? this.categoryService
            .getCategoryAndChildrenNames(filters.category)
            .map((category) => category.toLowerCase())
        : [];

      return products.filter((product) => {
        const categoryMatch = filters.category
          ? validCategories.includes(product.category.toLowerCase())
          : true;
        const searchMatch = filters.search
          ? `${product.title} ${product.brand} ${product.category}`
              .toLowerCase()
              .includes(filters.search)
          : true;

        return categoryMatch && searchMatch;
      });
    })
  );

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1, product.sizes[0]);
    this.toastService.showAddedToCart(product.title, 1);
  }

  selectCategory(categoryName: string | null): void {
    const currentSearch = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/products'], {
      queryParams: {
        category: categoryName,
        q: currentSearch || null
      }
    });
  }
}
