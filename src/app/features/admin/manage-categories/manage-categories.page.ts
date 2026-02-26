import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  readonly categories$ = this.categoryService.getCategories();

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    slug: [''],
    icon: ['fa-tag', [Validators.required]],
    image: ['', [Validators.required]],
    parentCategory: [''],
    featured: [true]
  });

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openAddModal(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.form.reset({
      name: '',
      slug: '',
      icon: 'fa-tag',
      image: '',
      parentCategory: '',
      featured: true
    });
    this.modalInstance?.show();
  }

  openEditModal(category: Category): void {
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
    this.form.patchValue({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      image: category.image,
      parentCategory: category.parentCategory ?? '',
      featured: category.featured ?? true
    });
    this.modalInstance?.show();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = (this.form.value.name ?? '').trim();
    const slug = this.normalizeSlug(this.form.value.slug || name);
    const payload: Category = {
      id: this.editingCategoryId ?? this.categoryService.getNextCategoryId(),
      name,
      slug,
      icon: this.form.value.icon ?? 'fa-tag',
      image: this.form.value.image ?? '',
      parentCategory: this.form.value.parentCategory || undefined,
      featured: this.form.value.featured ?? true
    };

    if (this.editingCategoryId) {
      this.categoryService.updateCategory(payload);
    } else {
      this.categoryService.addCategory(payload);
    }

    this.modalInstance?.hide();
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) {
      return;
    }

    this.categoryService.deleteCategory(id);
  }

  shouldHideParentOption(name: string): boolean {
    return this.editingCategoryName === name;
  }

  private normalizeSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}

