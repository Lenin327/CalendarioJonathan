import {
  Component, signal, Output, EventEmitter,
  ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div
      class="cdialog-backdrop"
      [class.cdialog-backdrop--open]="open()"
      (click)="onBackdropClick($event)"
      role="alertdialog"
      [attr.aria-label]="opts().title"
    >
      <div class="cdialog" [class.cdialog--open]="open()">
        <!-- Icon -->
        <div class="cdialog__icon" [class.cdialog__icon--danger]="opts().danger">
          <svg *ngIf="opts().danger" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg *ngIf="!opts().danger" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h3 class="cdialog__title">{{ opts().title }}</h3>
        <p class="cdialog__message">{{ opts().message }}</p>

        <div class="cdialog__actions">
          <button class="cdialog__btn cdialog__btn--cancel"
            (click)="onCancel()" type="button">
            {{ opts().cancelLabel || 'Cancelar' }}
          </button>
          <button
            class="cdialog__btn"
            [class.cdialog__btn--danger]="opts().danger"
            [class.cdialog__btn--confirm]="!opts().danger"
            (click)="onConfirm()" type="button">
            {{ opts().confirmLabel || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cdialog-backdrop {
      position: fixed; inset: 0; z-index: 400;
      background: rgb(0 0 0 / 0); backdrop-filter: blur(0px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem; pointer-events: none;
      transition: background 0.2s, backdrop-filter 0.2s;
    }
    .cdialog-backdrop--open {
      background: rgb(0 0 0 / .6); backdrop-filter: blur(5px); pointer-events: all;
    }
    .cdialog {
      background: var(--surface-1); border: 1px solid var(--border);
      border-radius: 1.25rem; box-shadow: 0 24px 64px rgb(0 0 0 / .3);
      padding: 1.75rem 1.5rem 1.375rem; max-width: 22rem; width: 100%;
      text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.625rem;
      transform: scale(0.88) translateY(1rem); opacity: 0;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease;
    }
    .cdialog--open { transform: scale(1) translateY(0); opacity: 1; }
    .cdialog__icon {
      width: 3.25rem; height: 3.25rem; border-radius: 50%;
      background: #dbeafe; color: var(--brand-600);
      display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
    }
    .cdialog__icon--danger { background: #fee2e2; color: #dc2626; }
    .cdialog__title { font-size: 1rem; font-weight: 800; color: var(--text-1); margin: 0; }
    .cdialog__message { font-size: 0.8125rem; color: var(--text-2); margin: 0; line-height: 1.6; }
    .cdialog__actions {
      display: flex; gap: 0.625rem; margin-top: 0.5rem; width: 100%;
    }
    .cdialog__btn {
      flex: 1; padding: 0.625rem; border: none; border-radius: 0.75rem;
      font-size: 0.875rem; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.15s;
    }
    .cdialog__btn:active { transform: scale(0.96); }
    .cdialog__btn--cancel { background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border); }
    .cdialog__btn--cancel:hover { background: var(--surface-3); }
    .cdialog__btn--confirm { background: var(--brand-600); color: #fff; }
    .cdialog__btn--confirm:hover { background: var(--brand-700); }
    .cdialog__btn--danger { background: #dc2626; color: #fff; }
    .cdialog__btn--danger:hover { background: #b91c1c; }
  `]
})
export class ConfirmDialogComponent {
  open = signal(false);
  opts = signal<ConfirmOptions>({ title: '', message: '' });

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  show(options: ConfirmOptions): void {
    this.opts.set(options);
    this.open.set(true);
  }

  hide(): void { this.open.set(false); }

  onConfirm(): void { this.hide(); this.confirmed.emit(); }
  onCancel():  void { this.hide(); this.cancelled.emit(); }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('cdialog-backdrop')) this.onCancel();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.open()) this.onCancel(); }
}
