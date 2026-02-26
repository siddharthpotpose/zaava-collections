import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../../../core/models/banner.model';
import { BannerService } from '../../../core/services/banner.service';

declare const bootstrap: {
  Modal: new (element: Element) => {
    show: () => void;
    hide: () => void;
  };
};

@Component({
  selector: 'app-manage-banners-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-banners.page.html',
  styleUrl: './manage-banners.page.css'
})
export class ManageBannersPage implements AfterViewInit {
  @ViewChild('bannerModal') modalElement?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly bannerService = inject(BannerService);

  private modalInstance?: { show: () => void; hide: () => void };
  editingBannerId: number | null = null;

  readonly banners$ = this.bannerService.getBanners();

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    subtitle: ['', [Validators.required]],
    image: ['', [Validators.required]],
    ctaLabel: ['Shop Now', [Validators.required]],
    ctaLink: ['/products', [Validators.required]]
  });

  ngAfterViewInit(): void {
    if (this.modalElement?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openAddModal(): void {
    this.editingBannerId = null;
    this.form.reset({
      title: '',
      subtitle: '',
      image: '',
      ctaLabel: 'Shop Now',
      ctaLink: '/products'
    });
    this.modalInstance?.show();
  }

  openEditModal(banner: Banner): void {
    this.editingBannerId = banner.id;
    this.form.patchValue({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      ctaLabel: banner.ctaLabel,
      ctaLink: banner.ctaLink
    });
    this.modalInstance?.show();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Banner = {
      id: this.editingBannerId ?? this.bannerService.getNextBannerId(),
      title: this.form.value.title ?? '',
      subtitle: this.form.value.subtitle ?? '',
      image: this.form.value.image ?? '',
      ctaLabel: this.form.value.ctaLabel ?? 'Shop Now',
      ctaLink: this.form.value.ctaLink ?? '/products'
    };

    if (this.editingBannerId) {
      this.bannerService.updateBanner(payload);
    } else {
      this.bannerService.addBanner(payload);
    }

    this.modalInstance?.hide();
  }

  deleteBanner(id: number): void {
    if (!confirm('Delete this banner slide?')) {
      return;
    }

    this.bannerService.deleteBanner(id);
  }
}
