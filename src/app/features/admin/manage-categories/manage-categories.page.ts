import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { DeleteConfirmModalComponent } from '../../../shared/components/delete-confirm-modal/delete-confirm-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DeleteConfirmModalComponent],
  templateUrl: './manage-categories.page.html',
  styleUrl: './manage-categories.page.css'
})
export class ManageCategoriesPage implements AfterViewInit {
  @ViewChild('categoryModal') modalElement?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  private modalInstance?: { show: () => void; hide: () => void };
  editingCategoryId: number | null = null;
  editingCategoryName = '';
  isDeleteConfirmOpen = false;
  pendingDeleteCategoryId: number | null = null;

  constructor(private service: CategoryService, private destroy: DestroyRef) { }

  ngOnInit() {
    this.getCategoryDetails();
  }

  categoryDataRes = signal<any[]>([]);

  getCategoryDetails() {
    this.service.getCategory().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (res: any) => {
        this.categoryDataRes.set(res.data)
      }
    })
  }

  categoryForm = new FormGroup({
    CategoryId: new FormControl(0),
    CategoryName: new FormControl('', [Validators.required]),
    ParentCategoryId: new FormControl(0),
    UserId: new FormControl(0)
  })

  isEditMode: boolean = false;
  categoryRes = signal<any[]>([]);

  submitForm() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const categoryRes = this.categoryForm.value;
    if (!this.isEditMode) {
      categoryRes.CategoryId = 0;
      categoryRes.ParentCategoryId =0;
      this.service.CreateNewCategory(categoryRes).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: (res: any) => {
          console.log(res);
          this.categoryRes.set(res.data);
          this.getCategoryDetails();
          this.modalInstance?.hide();
        }
      })
    }
  }

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openAddModal(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.categoryForm.reset();
    this.modalInstance?.show();
  }

  openEditModal(item: any): void {
    this.editingCategoryId = item.categoryId;
    this.editingCategoryName = item.categoryName;
    this.categoryForm.patchValue({
      CategoryId: item.categoryId,
      CategoryName: item.categoryName,
      ParentCategoryId: item.parentCategoryId,
      UserId: item.userId
    })
    this.modalInstance?.show();
  }

  deleteCategory(id: number): void {
    this.pendingDeleteCategoryId = id;
    this.isDeleteConfirmOpen = true;
  }

  cancelDeleteCategory(): void {
    this.pendingDeleteCategoryId = null;
    this.isDeleteConfirmOpen = false;
  }

  confirmDeleteCategory(): void {
    if (this.pendingDeleteCategoryId === null) {
      return;
    }

    this.service.DeleteCategoryById(this.pendingDeleteCategoryId).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next : (res:any)=>{
        console.log(res);
        this.getCategoryDetails();
      }
    })

    this.cancelDeleteCategory();
  }


}

