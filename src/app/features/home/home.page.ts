import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { BannerService } from '../../core/services/banner.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getProductImageUrls } from '../../core/utils/product-images.util';

declare const bootstrap: {
  Carousel: new (
    element: Element,
    options?: { interval?: number | false; ride?: string | boolean; pause?: string | boolean; wrap?: boolean }
  ) => {
    cycle: () => void;
    dispose: () => void;
  };
};

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
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('heroCarouselEl') heroCarouselEl?: ElementRef<HTMLDivElement>;

  private readonly bannerService = inject(BannerService);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private heroCarouselInstance?: { cycle: () => void; dispose: () => void };

  constructor(private destroy: DestroyRef) { }

  ngOnInit(): void {
    this.getCategoryList();
    this.getProductData();
  }

  readonly categoryListRes = signal<ApiCategory[]>([]);
  readonly productRes = signal<ApiProduct[]>([]);

  readonly topLevelCategories = computed(() => {
    const categories = this.categoryListRes();
    const parentCategories = categories.filter((category) => Number(category.parentCategoryId) === 0);
    return parentCategories.length > 0 ? parentCategories : categories;
  });

  readonly featuredProducts = computed(() =>
    this.productRes().slice(0, 8).map((product) => this.mapApiProductToUi(product))
  );

  readonly categoryRows = computed(() => {
    const allCategories = this.categoryListRes();
    const parentCategories = this.topLevelCategories();
    const products = this.productRes();

    return parentCategories.map((category) => {
      const validCategoryIds = this.collectCategoryAndChildIds(category.categoryId, allCategories);
      const rowProducts = products
        .filter((product) => validCategoryIds.has(Number(product.categoryId)))
        .slice(0, 8)
        .map((product) => this.mapApiProductToUi(product));

      return {
        category,
        products: rowProducts
      };
    });
  });

  getCategoryList(): void {
    this.categoryService.getCategory().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.categoryListRes.set(Array.isArray(res?.data) ? res.data : []);
      }
    });
  }

  getProductData(): void {
    this.productService.getProduct().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.productRes.set(Array.isArray(res?.data) ? res.data : []);
      }
    });
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

  readonly banners$ = this.bannerService.getBanners();

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1, product.sizes[0] ?? 'Standard');
    this.toastService.showAddedToCart(product.title, 1);
  }

  openBannerLink(link: string): void {
    const [path, queryString] = link.split('?');

    if (queryString) {
      const params = new URLSearchParams(queryString);
      const category = params.get('category');
      this.router.navigate([path], {
        queryParams: { category: category ?? null }
      });
      return;
    }

    this.router.navigateByUrl(path);
  }

  ngAfterViewInit(): void {
    if (!this.heroCarouselEl?.nativeElement) {
      return;
    }

    try {
      this.heroCarouselInstance = new bootstrap.Carousel(this.heroCarouselEl.nativeElement, {
        interval: 3200,
        ride: 'carousel',
        pause: false,
        wrap: true
      });
      this.heroCarouselInstance.cycle();
    } catch {
      // Ignore if Bootstrap JS is unavailable.
    }
  }

  ngOnDestroy(): void {
    this.heroCarouselInstance?.dispose();
  }

  private collectCategoryAndChildIds(rootCategoryId: number, categories: ApiCategory[]): Set<number> {
    const ids = new Set<number>();
    const stack = [Number(rootCategoryId)];

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
