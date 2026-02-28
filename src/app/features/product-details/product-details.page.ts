import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';

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
  selector: 'app-product-details-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-details.page.html',
  styleUrl: './product-details.page.css'
})
export class ProductDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly destroy = inject(DestroyRef);

  product?: Product;
  selectedImage = 0;
  modalImageIndex = 0;
  quantity = 1;
  selectedSize = '';
  suggestionSlides: Product[][] = [];
  private readonly apiProducts = signal<Product[]>([]);
  private requestedProductId: number | null = null;

  ngOnInit(): void {
    this.loadAllProducts();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) {
        this.requestedProductId = null;
        this.setActiveProduct(undefined);
        return;
      }

      this.requestedProductId = id;
      if (!this.trySetProductFromList(id)) {
        this.setActiveProduct(undefined);
      }
    });
  }

  get discountedPrice(): number {
    if (!this.product) {
      return 0;
    }

    return this.product.price - this.product.price * (this.product.discountPercentage / 100);
  }

  selectThumbnail(index: number): void {
    this.selectedImage = index;
  }

  openImageModal(index: number): void {
    this.modalImageIndex = index;
  }

  previousModalImage(): void {
    if (!this.product) {
      return;
    }

    const imageCount = this.product.images.length;
    this.modalImageIndex = (this.modalImageIndex - 1 + imageCount) % imageCount;
  }

  nextModalImage(): void {
    if (!this.product) {
      return;
    }

    const imageCount = this.product.images.length;
    this.modalImageIndex = (this.modalImageIndex + 1) % imageCount;
  }

  decrementQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  incrementQuantity(): void {
    this.quantity += 1;
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.cartService.addToCart(this.product, this.quantity, this.selectedSize || this.product.sizes[0] || 'Standard');
    this.toastService.showAddedToCart(this.product.title, this.quantity);
  }

  private loadAllProducts(): void {
    const cachedProducts = this.productService.getCachedApiProducts<ApiProduct>();
    if (cachedProducts.length > 0) {
      this.setApiProducts(cachedProducts);
    }

    this.productService.getProduct().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        const products = Array.isArray(res?.data) ? res.data : [];
        this.setApiProducts(products);
      }
    });
  }

  private setApiProducts(products: ApiProduct[]): void {
    this.apiProducts.set(products.map((item: ApiProduct) => this.mapApiProductToUi(item)));

    if (this.requestedProductId && !this.product) {
      this.trySetProductFromList(this.requestedProductId);
    }

    if (this.product) {
      this.buildSuggestionSlides(this.product);
    }
  }

  private setActiveProduct(product: Product | undefined): void {
    this.product = product;
    this.selectedImage = 0;
    this.modalImageIndex = 0;
    this.quantity = 1;
    this.selectedSize = this.product?.sizes[0] ?? 'Standard';

    if (this.product) {
      this.buildSuggestionSlides(this.product);
      return;
    }

    this.suggestionSlides = [];
  }

  private trySetProductFromList(productId: number): boolean {
    const fallback = this.apiProducts().find((item) => item.id === productId);
    if (!fallback) {
      return false;
    }

    this.setActiveProduct(fallback);
    return true;
  }

  private buildSuggestionSlides(product: Product): void {
    const allProducts = this.apiProducts();
    if (allProducts.length === 0) {
      this.suggestionSlides = [];
      return;
    }

    const sameCategoryProducts = allProducts.filter(
      (item) => item.id !== product.id && item.category === product.category
    );

    const sareeFamilyProducts = allProducts.filter(
      (item) =>
        item.id !== product.id &&
        item.category.toLowerCase().includes('saree') &&
        product.category.toLowerCase().includes('saree')
    );

    const fallbackProducts = allProducts.filter((item) => item.id !== product.id);

    const suggestions =
      sameCategoryProducts.length > 0
        ? sameCategoryProducts
        : sareeFamilyProducts.length > 0
          ? sareeFamilyProducts
          : fallbackProducts;

    this.suggestionSlides = this.chunkProducts(suggestions.slice(0, 8), 4);
  }

  private chunkProducts(products: Product[], chunkSize: number): Product[][] {
    const chunks: Product[][] = [];

    for (let i = 0; i < products.length; i += chunkSize) {
      chunks.push(products.slice(i, i + chunkSize));
    }

    return chunks;
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
      images: [product.productImageUrl || 'https://via.placeholder.com/600x600?text=Product'],
      sizes: ['Standard'],
      stock: 50
    };
  }
}
