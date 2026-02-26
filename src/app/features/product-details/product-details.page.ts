import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ToastNotificationService } from '../../core/services/toast-notification.service';

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

  product?: Product;
  selectedImage = 0;
  modalImageIndex = 0;
  quantity = 1;
  selectedSize = '';
  suggestionSlides: Product[][] = [];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      const found = this.productService.getProductById(id);
      this.product = found;
      this.selectedImage = 0;
      this.modalImageIndex = 0;
      this.quantity = 1;
      this.selectedSize = found?.sizes[0] ?? '';

      if (found) {
        this.buildSuggestionSlides(found);
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

    this.cartService.addToCart(this.product, this.quantity, this.selectedSize || this.product.sizes[0]);
    this.toastService.showAddedToCart(this.product.title, this.quantity);
  }

  private buildSuggestionSlides(product: Product): void {
    const allProducts = this.productService.getProductsSnapshot();
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
}
