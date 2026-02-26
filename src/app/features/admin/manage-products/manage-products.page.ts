import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './manage-products.page.html',
  styleUrl: './manage-products.page.css'
})
export class ManageProductsPage implements AfterViewInit {
  @ViewChild('productModal') modalElement?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  private modalInstance?: { show: () => void; hide: () => void };
  editingProductId: number | null = null;

  readonly products$ = this.productService.getProducts();
  readonly categories$ = this.categoryService.getCategories().pipe(
    map((categories) => categories.filter((category) => category.featured))
  );

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    category: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(90)]],
    rating: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    description: ['', [Validators.required]],
    sizes: ['', [Validators.required]],
    stock: [1, [Validators.required, Validators.min(1)]],
    images: ['', [Validators.required]]
  });

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openAddModal(): void {
    this.editingProductId = null;
    const defaultCategory = this.categoryService.getCategoriesSnapshot()[0]?.name ?? '';

    this.form.reset({
      title: '',
      brand: '',
      category: defaultCategory,
      price: 0,
      discountPercentage: 0,
      rating: 4,
      description: '',
      sizes: '',
      stock: 1,
      images: ''
    });
    this.modalInstance?.show();
  }

  openEditModal(product: Product): void {
    this.editingProductId = product.id;
    this.form.patchValue({
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      description: product.description,
      sizes: product.sizes.join(', '),
      stock: product.stock,
      images: product.images.join(', ')
    });
    this.modalInstance?.show();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const sizes = (this.form.value.sizes ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);

    const images = (this.form.value.images ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);

    const payload: Product = {
      id: this.editingProductId ?? this.generateProductId(),
      title: this.form.value.title ?? '',
      brand: this.form.value.brand ?? '',
      category: this.form.value.category ?? '',
      price: Number(this.form.value.price ?? 0),
      discountPercentage: Number(this.form.value.discountPercentage ?? 0),
      rating: Number(this.form.value.rating ?? 0),
      description: this.form.value.description ?? '',
      sizes,
      stock: Number(this.form.value.stock ?? 0),
      images
    };

    if (this.editingProductId) {
      this.productService.updateProduct(payload);
    } else {
      this.productService.addProduct(payload);
    }

    this.modalInstance?.hide();
  }

  deleteProduct(id: number): void {
    if (!confirm('Delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id);
  }

  private generateProductId(): number {
    const ids = this.productService.getProductsSnapshot().map((product) => product.id);
    return (Math.max(...ids, 0) || 0) + 1;
  }
}
