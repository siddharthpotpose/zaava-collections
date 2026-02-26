import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrl: './delete-confirm-modal.component.css'
})
export class DeleteConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Delete Record';
  @Input() message = 'Delete this record?';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isOpen) {
      return;
    }

    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  onNo(): void {
    this.cancelled.emit();
  }

  onYes(): void {
    this.confirmed.emit();
  }
}
