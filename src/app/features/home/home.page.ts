import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { BannerService } from '../../core/services/banner.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

declare const bootstrap: {
  Carousel: new (
    element: Element,
    options?: { interval?: number | false; ride?: string | boolean; pause?: string | boolean; wrap?: boolean }
  ) => {
    cycle: () => void;
    dispose: () => void;
  };
};

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
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private heroCarouselInstance?: { cycle: () => void; dispose: () => void };

  readonly banners$ = this.bannerService.getBanners();
  readonly categories$ = this.categoryService.getCategories().pipe(
    map((categories) => categories.filter((category) => category.featured))
  );
  readonly featuredProducts$ = this.productService.getProducts().pipe(map((products) => products.slice(0, 8)));

  readonly sareeFocus$ = this.productService.getProducts().pipe(
    map((products) => products.filter((product) => product.category.toLowerCase().includes('saree')).slice(0, 6))
  );

  readonly categoryRows$ = combineLatest([
    this.categories$,
    this.productService.getProducts()
  ]).pipe(
    map(([categories, products]) => {
      return categories.map((category) => ({
        category,
        products: this.getProductsByCategory(category, products).slice(0, 8)
      }));
    })
  );

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1, product.sizes[0]);
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

  private getProductsByCategory(category: Category, products: Product[]): Product[] {
    if (category.name === 'Saree') {
      return products.filter((product) => product.category.toLowerCase().includes('saree'));
    }

    const childCategories = this.categoryService
      .getCategoryAndChildrenNames(category.name)
      .map((name) => name.toLowerCase());

    return products.filter((product) => childCategories.includes(product.category.toLowerCase()));
  }
}
