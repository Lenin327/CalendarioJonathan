import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type BtnSize    = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
      [class]="buttonClass"
    >
      <span *ngIf="loading" class="btn-spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      transition: all 0.18s ease;
      outline: none;
      position: relative;
      -webkit-tap-highlight-color: transparent;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button:active:not(:disabled) { transform: scale(0.95); }

    .btn-sm  { padding: 0.375rem 0.75rem;  font-size: 0.75rem;  border-radius: 0.625rem; }
    .btn-md  { padding: 0.5rem   1rem;     font-size: 0.875rem; border-radius: 0.75rem;  }
    .btn-lg  { padding: 0.75rem  1.5rem;   font-size: 1rem;     border-radius: 1rem;     }
    .btn-icon{ padding: 0.5rem;  aspect-ratio: 1; border-radius: 0.625rem; }

    .btn-primary  { background: var(--brand-600); color: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / .15); }
    .btn-primary:hover:not(:disabled) { background: var(--brand-700); }

    .btn-secondary{ background: var(--surface-2); color: var(--text-1); }
    .btn-secondary:hover:not(:disabled) { background: var(--surface-3); }

    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--text-1); }

    .btn-danger { background: transparent; color: var(--text-2); }
    .btn-danger:hover:not(:disabled) { background: #fee2e2; color: #ef4444; }

    .btn-success{ background: transparent; color: var(--text-2); }
    .btn-success:hover:not(:disabled) { background: #d1fae5; color: #10b981; }

    .btn-spinner {
      width: 0.875rem; height: 0.875rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class BtnComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading  = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    return `btn-${this.size} btn-${this.variant}`;
  }
}
