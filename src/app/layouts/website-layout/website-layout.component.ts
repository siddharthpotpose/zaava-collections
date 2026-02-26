import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Advertisement } from '../../core/models/advertisement.model';
import { AdvertisementService } from '../../core/services/advertisement.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { CartToastComponent } from '../../shared/components/cart-toast/cart-toast.component';

@Component({
  selector: 'app-website-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet, CartToastComponent],
  templateUrl: './website-layout.component.html',
  styleUrl: './website-layout.component.css'
})
export class WebsiteLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);
  private readonly categoryService = inject(CategoryService);
  private readonly advertisementService = inject(AdvertisementService);
  private readonly supportPaths = new Set([
    '/terms-and-conditions',
    '/privacy-policy',
    '/shipping-policy',
    '/return-policy'
  ]);
  private hasShownAdvertisement = false;

  searchTerm = '';
  readonly currentYear = new Date().getFullYear();
  showCategoryStrip = true;
  isAdvertisementVisible = false;
  activeAdvertisement: Advertisement | null = null;

  readonly categories$ = this.categoryService.getCategories();
  readonly featuredCategories$ = this.categoryService.getCategories().pipe(
    map((categories) => categories.filter((category) => category.featured).slice(0, 8))
  );

  readonly cartCount$ = this.cartService.cartItems$.pipe(
    map((items) => items.reduce((count, item) => count + item.quantity, 0))
  );

  constructor() {
    this.updateCategoryStripVisibility(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.updateCategoryStripVisibility(event.urlAfterRedirects);
      });

    this.advertisementService
      .getAdvertisements()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const activeAdvertisement = this.advertisementService.getActiveAdvertisement(new Date());

        if (this.isAdvertisementVisible && !activeAdvertisement) {
          this.isAdvertisementVisible = false;
          this.activeAdvertisement = null;
        }
      });
  }

  onSearch(): void {
    this.router.navigate(['/products'], {
      queryParams: {
        q: this.searchTerm || null
      }
    });
  }

  goToCategory(category: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category }
    });
  }

  closeAdvertisementPopup(): void {
    this.isAdvertisementVisible = false;
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  onFirstWebsiteClick(): void {
    if (this.hasShownAdvertisement || this.isAdvertisementVisible) {
      return;
    }

    const activeAdvertisement = this.advertisementService.getActiveAdvertisement(new Date());

    if (!activeAdvertisement) {
      return;
    }

    this.activeAdvertisement = activeAdvertisement;
    this.isAdvertisementVisible = true;
    this.hasShownAdvertisement = true;
  }

  private updateCategoryStripVisibility(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.showCategoryStrip = !this.supportPaths.has(cleanUrl);
  }
}
