import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="'badge badge--' + color">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      min-width: 2rem;
    }
    .badge--default { background: var(--surface-2); color: var(--text-2); }
    .badge--brand   { background: var(--brand-100); color: var(--brand-700); }
    .badge--success { background: #d1fae5; color: #065f46; }
    .badge--warning { background: #fef3c7; color: #92400e; }
    :host-context(.dark) .badge--default { background: var(--surface-3); color: var(--text-2); }
    :host-context(.dark) .badge--brand   { background: var(--brand-800); color: var(--brand-300); }
    :host-context(.dark) .badge--success { background: #064e3b; color: #6ee7b7; }
    :host-context(.dark) .badge--warning { background: #78350f; color: #fcd34d; }
  `]
})
export class BadgeComponent {
  @Input() label = '';
  @Input() color: 'default' | 'brand' | 'success' | 'warning' = 'default';
}
