import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';
import { getProductImageUrls } from '../../core/utils/product-images.util';

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
  isModalImageZoomed = false;
  isModalImagePanning = false;
  modalImagePanX = 0;
  modalImagePanY = 0;
  quantity = 1;
  selectedSize = '';
  suggestionSlides: Product[][] = [];
  private readonly apiProducts = signal<Product[]>([]);
  private requestedProductId: number | null = null;
  private readonly modalImageZoomScale = 1.8;
  private panStartPointerX = 0;
  private panStartPointerY = 0;
  private panStartImageX = 0;
  private panStartImageY = 0;
  private shouldSuppressZoomToggle = false;
  isSmallDevice = false;


  ngOnInit(): void {
     this.checkScreenSize();
  window.addEventListener('resize', this.checkScreenSize.bind(this));

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


  private checkScreenSize(): void {
  this.isSmallDevice = window.innerWidth < 768; // Bootstrap mobile breakpoint
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
    this.resetModalImageZoom();
  }

  previousModalImage(): void {
    if (!this.product) {
      return;
    }

    const imageCount = this.product.images.length;
    this.modalImageIndex = (this.modalImageIndex - 1 + imageCount) % imageCount;
    this.resetModalImageZoom();
  }

  nextModalImage(): void {
    if (!this.product) {
      return;
    }

    const imageCount = this.product.images.length;
    this.modalImageIndex = (this.modalImageIndex + 1) % imageCount;
    this.resetModalImageZoom();
  }

  toggleModalImageZoom(): void {
    if (this.shouldSuppressZoomToggle) {
      this.shouldSuppressZoomToggle = false;
      return;
    }

    this.isModalImageZoomed = !this.isModalImageZoomed;
    if (!this.isModalImageZoomed) {
      this.resetModalImagePan();
    }
  }

  resetModalImageZoom(): void {
    this.isModalImageZoomed = false;
    this.resetModalImagePan();
  }

  onModalImagePointerDown(event: PointerEvent): void {
    if (!this.isModalImageZoomed) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture(event.pointerId);
    this.isModalImagePanning = true;
    this.panStartPointerX = event.clientX;
    this.panStartPointerY = event.clientY;
    this.panStartImageX = this.modalImagePanX;
    this.panStartImageY = this.modalImagePanY;
    this.shouldSuppressZoomToggle = false;
    event.preventDefault();
  }

  onModalImagePointerMove(event: PointerEvent): void {
    if (!this.isModalImageZoomed || !this.isModalImagePanning) {
      return;
    }

    const imageElement = event.currentTarget as HTMLElement | null;
    if (!imageElement) {
      return;
    }

    const deltaX = event.clientX - this.panStartPointerX;
    const deltaY = event.clientY - this.panStartPointerY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      this.shouldSuppressZoomToggle = true;
    }

    const { maxX, maxY } = this.getMaxPanOffsets(imageElement);
    this.modalImagePanX = this.clamp(this.panStartImageX + deltaX, -maxX, maxX);
    this.modalImagePanY = this.clamp(this.panStartImageY + deltaY, -maxY, maxY);
    event.preventDefault();
  }

  onModalImagePointerUp(event: PointerEvent): void {
    if (!this.isModalImagePanning) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;
    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.isModalImagePanning = false;
  }

  get modalImageTransformStyle(): string {
    if (!this.isModalImageZoomed) {
      return 'translate3d(0px, 0px, 0px) scale(1)';
    }

    return `translate3d(${this.modalImagePanX}px, ${this.modalImagePanY}px, 0px) scale(${this.modalImageZoomScale})`;
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
    this.isModalImageZoomed = false;
    this.quantity = 1;
    this.selectedSize = this.product?.sizes[0] ?? 'Standard';

    if (this.product) {
      this.buildSuggestionSlides(this.product);
      return;
    }

    this.suggestionSlides = [];
  }

  private resetModalImagePan(): void {
    this.isModalImagePanning = false;
    this.modalImagePanX = 0;
    this.modalImagePanY = 0;
    this.panStartPointerX = 0;
    this.panStartPointerY = 0;
    this.panStartImageX = 0;
    this.panStartImageY = 0;
  }

  private getMaxPanOffsets(imageElement: HTMLElement): { maxX: number; maxY: number } {
    const width = imageElement.clientWidth;
    const height = imageElement.clientHeight;
    const maxX = Math.max(0, ((width * this.modalImageZoomScale) - width) / 2);
    const maxY = Math.max(0, ((height * this.modalImageZoomScale) - height) / 2);

    return { maxX, maxY };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
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
      images: getProductImageUrls(product.productImageUrl, 5),
      sizes: ['Standard'],
      stock: 50
    };
  }
}
