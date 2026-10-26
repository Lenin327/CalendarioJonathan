import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast" [class.toast--visible]="visible" role="alert" aria-live="polite">
      <span class="toast__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </span>
      <span class="toast__message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1.125rem;
      background: var(--surface-inv);
      color: var(--text-inv);
      border-radius: 0.875rem;
      box-shadow: 0 8px 32px rgb(0 0 0 / .25);
      font-size: 0.875rem;
      font-weight: 500;
      transform: translateY(5rem);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease;
      pointer-events: none;
    }
    .toast--visible {
      transform: translateY(0);
      opacity: 1;
    }
    .toast__icon { color: var(--brand-400); flex-shrink: 0; }
  `]
})
export class ToastComponent implements OnChanges {
  @Input() message = '';
  @Input() trigger = 0; // Incrementar para mostrar el toast

  visible = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trigger'] && !changes['trigger'].firstChange) {
      this.show();
    }
  }

  private show(): void {
    if (this.timer) clearTimeout(this.timer);
    this.visible = true;
    this.timer = setTimeout(() => { this.visible = false; }, 3000);
  }
}
