import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-navigator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-nav">
      <button class="date-nav__btn" (click)="prev.emit()" title="Día anterior" aria-label="Día anterior">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div class="date-nav__center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="date-nav__cal-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input
          type="date"
          class="date-nav__input"
          [ngModel]="currentDate"
          (ngModelChange)="dateChange.emit($event)"
          aria-label="Seleccionar fecha"
        >
      </div>

      <button class="date-nav__btn" (click)="next.emit()" title="Día siguiente" aria-label="Día siguiente">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <button class="date-nav__today" (click)="today.emit()" aria-label="Ir a hoy">Hoy</button>
    </div>
  `,
  styles: [`
    .date-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--surface-2);
      padding: 0.375rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
    }
    .date-nav__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border: none;
      background: transparent;
      color: var(--text-2);
      border-radius: 0.625rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .date-nav__btn:hover { background: var(--surface-1); color: var(--text-1); }
    .date-nav__btn:active { transform: scale(0.92); }

    .date-nav__center {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0 0.5rem;
    }
    .date-nav__cal-icon { color: var(--brand-600); }

    .date-nav__input {
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-1);
      font-family: inherit;
      cursor: pointer;
      min-width: 120px;
    }

    .date-nav__today {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.375rem 0.625rem;
      background: var(--brand-600);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.15s;
      margin-left: 0.125rem;
      -webkit-tap-highlight-color: transparent;
    }
    .date-nav__today:hover { background: var(--brand-700); }
    .date-nav__today:active { transform: scale(0.92); }
  `]
})
export class DateNavigatorComponent {
  @Input() currentDate = '';
  @Output() prev       = new EventEmitter<void>();
  @Output() next       = new EventEmitter<void>();
  @Output() today      = new EventEmitter<void>();
  @Output() dateChange = new EventEmitter<string>();
}
