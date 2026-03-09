import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { map } from 'rxjs';
import { Advertisement, AdvertisementLayout } from '../../../core/models/advertisement.model';
import { AdvertisementService } from '../../../core/services/advertisement.service';
import { DeleteConfirmModalComponent } from '../../../shared/components/delete-confirm-modal/delete-confirm-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getPrimaryProductImageUrl } from '../../../core/utils/product-images.util';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-advertisements-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DeleteConfirmModalComponent],
  templateUrl: './manage-advertisements.page.html',
  styleUrl: './manage-advertisements.page.css'
})
export class ManageAdvertisementsPage implements AfterViewInit {
  @ViewChild('advertisementModal') modalElement?: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInputElement?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly advertisementService = inject(AdvertisementService);

  private modalInstance?: { show: () => void; hide: () => void };

  editingAdvertisementId: number | null = null;
  selectedImageName = '';
  isDeleteConfirmOpen = false;
  pendingDeleteAdvertisementId: number | null = null;

  offerRes = signal<any[]>([]);


  constructor(private service : AdvertisementService, private destroy : DestroyRef){}

  ngOnInit(){
    this.getAllOffers();
  }

  getAllOffers(){
    this.service.GetAllOffers().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next : (res:any)=>{
        this.offerRes.set(res.data)
        console.log(res.data)
      }
    })
  }

   getPrimaryImageUrl(rawImageUrl: string | null | undefined): string {
      return getPrimaryProductImageUrl(rawImageUrl, 5);
    }


  readonly advertisements$ = this.advertisementService
    .getAdvertisements()
    .pipe(map((advertisements) => [...advertisements].sort((a, b) => b.id - a.id)));

  readonly form = this.fb.nonNullable.group({
    layout: this.fb.nonNullable.control<AdvertisementLayout>('horizontal', [Validators.required]),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
    subtext: this.fb.nonNullable.control('', [Validators.required, this.maxWordsValidator(70)]),
    startDate: this.fb.nonNullable.control('', [Validators.required]),
    endDate: this.fb.nonNullable.control('', [Validators.required]),
    image: this.fb.nonNullable.control('', [Validators.required]),
    enabled: this.fb.nonNullable.control(true)
  });

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openAddModal(): void {
    this.editingAdvertisementId = null;
    this.selectedImageName = '';
    this.form.reset(this.getDefaultFormValue());
    this.resetImageInput();
    this.modalInstance?.show();
  }

  openEditModal(advertisement: Advertisement): void {
    this.editingAdvertisementId = advertisement.id;
    this.selectedImageName = '';
    this.form.reset({
      layout: advertisement.layout,
      title: advertisement.title,
      subtext: advertisement.subtext,
      startDate: advertisement.startDate,
      endDate: advertisement.endDate,
      image: advertisement.image,
      enabled: advertisement.enabled
    });
    this.resetImageInput();
    this.modalInstance?.show();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    if (files.length > 1) {
      this.selectedImageName = '';
      this.resetImageInput();
      alert('Please select only one image at a time.');
      return;
    }

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      this.selectedImageName = '';
      this.resetImageInput();
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        return;
      }

      this.form.controls.image.setValue(result);
      this.form.controls.image.markAsDirty();
      this.selectedImageName = file.name;
    };

    reader.readAsDataURL(file);
  }

  removeSelectedImage(): void {
    this.selectedImageName = '';
    this.form.controls.image.setValue('');
    this.form.controls.image.markAsDirty();
    this.form.controls.image.markAsTouched();
    this.resetImageInput();
  }

  formatHeadingFromInput(): void {
    const current = this.form.controls.title.value;
    this.form.controls.title.setValue(this.toTitleCase(current));
  }

  save(): void {
    const hasInvalidDateRange = this.hasInvalidDateRange();

    if (hasInvalidDateRange || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: Advertisement = {
      id: this.editingAdvertisementId ?? this.advertisementService.getNextAdvertisementId(),
      layout: formValue.layout,
      title: this.toTitleCase(formValue.title),
      subtext: formValue.subtext.trim(),
      image: formValue.image.trim(),
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      enabled: formValue.enabled,
      updatedAt: new Date().toISOString()
    };

    if (this.editingAdvertisementId) {
      this.advertisementService.updateAdvertisement(payload);
    } else {
      this.advertisementService.addAdvertisement(payload);
    }

    this.modalInstance?.hide();
  }

  deleteAdvertisement(id: number): void {
    this.pendingDeleteAdvertisementId = id;
    this.isDeleteConfirmOpen = true;
  }

  cancelDeleteAdvertisement(): void {
    this.pendingDeleteAdvertisementId = null;
    this.isDeleteConfirmOpen = false;
  }

  confirmDeleteAdvertisement(): void {
    if (this.pendingDeleteAdvertisementId === null) {
      return;
    }

    this.advertisementService.deleteAdvertisement(this.pendingDeleteAdvertisementId);
    this.cancelDeleteAdvertisement();
  }

  showFieldError(control: AbstractControl<unknown, unknown> | null): boolean {
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty);
  }

  hasFieldError(control: AbstractControl<unknown, unknown> | null, errorKey: string): boolean {
    if (!this.showFieldError(control)) {
      return false;
    }

    return !!control?.errors?.[errorKey];
  }

  getStatus(advertisement: Advertisement): 'Active' | 'Scheduled' | 'Expired' | 'Disabled' {
    if (!advertisement.enabled) {
      return 'Disabled';
    }

    const today = this.formatDateInput(new Date());

    if (today < advertisement.startDate) {
      return 'Scheduled';
    }

    if (today > advertisement.endDate) {
      return 'Expired';
    }

    return 'Active';
  }

  getStatusClass(advertisement: Advertisement): string {
    const status = this.getStatus(advertisement);

    if (status === 'Active') {
      return 'text-bg-success';
    }

    if (status === 'Scheduled') {
      return 'text-bg-primary';
    }

    if (status === 'Expired') {
      return 'text-bg-secondary';
    }

    return 'text-bg-dark';
  }

  private hasInvalidDateRange(): boolean {
    const { startDate, endDate } = this.form.getRawValue();

    if (!startDate || !endDate || endDate >= startDate) {
      this.clearDateRangeError();
      return false;
    }

    const currentErrors = this.form.controls.endDate.errors ?? {};
    this.form.controls.endDate.setErrors({ ...currentErrors, dateRange: true });
    return true;
  }

  private clearDateRangeError(): void {
    const currentErrors = this.form.controls.endDate.errors;

    if (!currentErrors?.['dateRange']) {
      return;
    }

    const { dateRange, ...rest } = currentErrors;
    this.form.controls.endDate.setErrors(Object.keys(rest).length ? rest : null);
  }

  private getDefaultFormValue() {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 2);

    return {
      layout: 'horizontal' as AdvertisementLayout,
      title: '',
      subtext: '',
      startDate: this.formatDateInput(today),
      endDate: this.formatDateInput(endDate),
      image: '',
      enabled: true
    };
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toTitleCase(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private maxWordsValidator(maxWords: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = `${control.value ?? ''}`.trim();

      if (!value) {
        return null;
      }

      const wordCount = value.split(/\s+/).filter(Boolean).length;

      if (wordCount <= maxWords) {
        return null;
      }

      return {
        maxWords: {
          actualWords: wordCount,
          maxWords
        }
      };
    };
  }

  private resetImageInput(): void {
    if (this.imageInputElement?.nativeElement) {
      this.imageInputElement.nativeElement.value = '';
    }
  }
}
