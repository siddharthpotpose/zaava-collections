import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { DeleteConfirmModalComponent } from '../../../shared/components/delete-confirm-modal/delete-confirm-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  getPrimaryProductImageUrl,
  normalizeProductImageUrls
} from '../../../core/utils/product-images.util';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DeleteConfirmModalComponent],
  templateUrl: './manage-products.page.html',
  styleUrl: './manage-products.page.css'
})
export class ManageProductsPage {
  @ViewChild('productModal') modalElement?: ElementRef<HTMLDivElement>;

  private modalInstance?: { show: () => void; hide: () => void };
  editingProductId: number | null = null;
  isDeleteConfirmOpen = false;
  pendingDeleteProductId: number | null = null;
  productsDataRes = signal<any[]>([]);
  getCategoryListRes = signal<any[]>([]);
  productResData = signal<any[]>([]);

  isEditMode: boolean = false;

  constructor(private service: ProductService, private category: CategoryService, private destroy: DestroyRef) { }

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }


  ngOnInit() {
    this.getProductDetails();
    this.getCategoryList();
  }

  getCategoryList() {
    this.category.getCategory().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.getCategoryListRes.set(res.data);
      }
    })
  }

  getProductDetails() {
    this.service.getProduct().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.productsDataRes.set(res.data);
        console.log(this.productsDataRes())
      }
    })
  }

  manageProductForm = new FormGroup({
    ProductId: new FormControl(0),
    ProductSku: new FormControl('', [Validators.required]),
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl('', [Validators.required]),
    ProductShortName: new FormControl('', [Validators.required]),
    ProductDescription: new FormControl('', [Validators.required]),
    CreatedDate: new FormControl('', [Validators.required]),
    DeliveryTimeSpan: new FormControl(''),
    CategoryId: new FormControl('', [Validators.required]),
    ProductImageUrl: new FormControl('', [Validators.required]),
    UserId: new FormControl(0),
  })


  submitForm() {
    if (this.manageProductForm.invalid) {
      this.manageProductForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.manageProductForm.value };
    const normalizedImageUrls = normalizeProductImageUrls(formData.ProductImageUrl, 5);
    if (!normalizedImageUrls) {
      this.manageProductForm.controls.ProductImageUrl.setErrors({ required: true });
      this.manageProductForm.controls.ProductImageUrl.markAsTouched();
      return;
    }
    formData.ProductImageUrl = normalizedImageUrls;

    if (!this.isEditMode) {
      formData.ProductId = 0;
      this.service.createProductEntry(formData).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: (res: any) => {
          this.productResData.set(res.data);
          console.log(this.productResData, 'productResData');
          this.getProductDetails();
          this.modalInstance?.hide();
        }
      })
    } else {
      this.service.UpdateProduct(formData).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: (res: any) => {
          console.log(res, 'update')
          this.getProductDetails();
          this.modalInstance?.hide();
        }
      })
    }
  }


  openEditModal(item: any) {
    this.isEditMode = true;
    this.editingProductId = item.id;
    this.manageProductForm.patchValue({
      ProductId: item.productId,
      ProductName: item.productName,
      ProductSku: item.productSku,
      ProductPrice: item.productPrice,
      ProductShortName: item.productShortName,
      ProductDescription: item.productDescription,
      CreatedDate: item.createdDate,
      DeliveryTimeSpan: item.deliveryTimeSpan,
      CategoryId: item.categoryId,
      ProductImageUrl: item.productImageUrl,
      UserId: item.userId
    })
    this.modalInstance?.show();
  }



  openAddModal(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.manageProductForm.reset();
    this.modalInstance?.show();
  }

  getPrimaryImageUrl(rawImageUrl: string | null | undefined): string {
    return getPrimaryProductImageUrl(rawImageUrl, 5);
  }


  deleteProduct(id: number): void {
    this.pendingDeleteProductId = id;
    this.isDeleteConfirmOpen = true;
  }

  cancelDeleteProduct(): void {
    this.pendingDeleteProductId = null;
    this.isDeleteConfirmOpen = false;
  }



  confirmDeleteProduct(): void {
    if (this.pendingDeleteProductId === null) {
      return;
    }
    this.service.DeleteProductById(this.pendingDeleteProductId).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        console.log(res);
        this.cancelDeleteProduct();
        this.getProductDetails();
      }
    })
  }


}
