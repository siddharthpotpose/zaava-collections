import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getProductImageUrls } from '../../core/utils/product-images.util';

interface ApiCategory {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number;
  userId: number | null;
}

interface ApiProduct {
  productId: number;
  productSku: string;
  productName: string;
  productPrice: number;
  productShortName: string;
  productDescription: string;
  createdDate: string;
  deliveryTimeSpan: string;
  categoryId: number;
  productImageUrl: string;
  categoryName: string;
}

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

  readonly productResData = signal<ApiProduct[]>([]);
  readonly categoryResData = signal<ApiCategory[]>([]);
  readonly selectedCategory = signal<string>('');
  readonly searchQuery = signal<string>('');

  readonly topLevelCategories = computed(() => {
    const categories = this.categoryResData();
    const parentCategories = categories.filter((category) => Number(category.parentCategoryId) === 0);
    return parentCategories.length > 0 ? parentCategories : categories;
  });

  readonly filteredProducts = computed(() => {
    const rawProducts = this.productResData();
    const selectedCategory = this.selectedCategory().trim().toLowerCase();
    const search = this.searchQuery().trim().toLowerCase();
    const categories = this.categoryResData();

    const validCategoryIds = selectedCategory
      ? this.getCategoryFamilyIdsByName(selectedCategory, categories)
      : null;

    return rawProducts
      .filter((product) => {
        const categoryName = (product.categoryName || '').toLowerCase();
        const categoryMatch = !selectedCategory
          ? true
          : validCategoryIds && validCategoryIds.size > 0
            ? validCategoryIds.has(Number(product.categoryId))
            : categoryName === selectedCategory;

        const searchable = `${product.productName} ${product.productShortName} ${product.productSku} ${product.categoryName}`
          .toLowerCase()
          .trim();
        const searchMatch = search ? searchable.includes(search) : true;

        return categoryMatch && searchMatch;
      })
      .map((product) => this.mapApiProductToUi(product));
  });

  constructor(private destroy: DestroyRef) {}

  ngOnInit(): void {
    this.getProductDetails();
    this.getCategoryDetails();
    this.watchQueryParams();
  }

  getProductDetails(): void {
    this.productService.getProduct().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.productResData.set(Array.isArray(res?.data) ? res.data : []);
      }
    });
  }

  getCategoryDetails(): void {
    this.categoryService.getCategory().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.categoryResData.set(Array.isArray(res?.data) ? res.data : []);
      }
    });
  }

  private watchQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe((params) => {
      this.selectedCategory.set((params.get('category') ?? '').trim());
      this.searchQuery.set((params.get('q') ?? '').trim());
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1, product.sizes[0] ?? 'Standard');
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

  private getCategoryFamilyIdsByName(
    selectedCategoryName: string,
    categories: ApiCategory[]
  ): Set<number> {
    const normalizedName = selectedCategoryName.toLowerCase();
    const selected = categories.find(
      (category) => (category.categoryName || '').toLowerCase() === normalizedName
    );

    if (!selected) {
      return new Set<number>();
    }

    const ids = new Set<number>();
    const stack = [Number(selected.categoryId)];

    while (stack.length > 0) {
      const categoryId = stack.pop();
      if (categoryId === undefined || ids.has(categoryId)) {
        continue;
      }

      ids.add(categoryId);
      categories
        .filter((category) => Number(category.parentCategoryId) === categoryId)
        .forEach((child) => stack.push(Number(child.categoryId)));
    }

    return ids;
  }

  private mapApiProductToUi(product: ApiProduct): Product {
    return {
      id: Number(product.productId),
      title: product.productName || 'Untitled Product',
      brand: product.productShortName || product.categoryName || 'ZAAVA',
      category: product.categoryName || 'General',
      price: Number(product.productPrice) || 0,
      discountPercentage: 0,
      rating: 4.5,
      description: product.productDescription || '',
      images: getProductImageUrls(product.productImageUrl, 5),
      sizes: ['Standard'],
      stock: 50
    };
  }
}
