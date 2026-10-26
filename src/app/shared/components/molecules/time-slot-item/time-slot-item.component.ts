import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeSlot } from '../../../../core/models/time-slot.model';

@Component({
  selector: 'app-time-slot-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slot" [class.slot--done]="slot.done" [class.slot--flagged]="slot.flag && !slot.done">
      <!-- Hora -->
      <div class="slot__time">
        <span class="slot__time-start">{{ time }}</span>
        <span class="slot__time-end">→ {{ endTime }}</span>
      </div>

      <!-- Input -->
      <div class="slot__input-wrap">
        <input
          type="text"
          class="slot__input"
          [class.slot__input--done]="slot.done"
          [value]="slot.text || ''"
          placeholder="¿Qué hiciste o planeas hacer?"
          (input)="textChange.emit({ time: time, text: $any($event.target).value })"
          [attr.aria-label]="'Bloque de tiempo ' + time"
        >
      </div>

      <!-- Acciones -->
      <div class="slot__actions">
        <!-- Destacar -->
        <button
          class="slot__action"
          [class.slot__action--active-flag]="slot.flag"
          (click)="flagToggle.emit(time)"
          title="Destacar"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
        <!-- Completar -->
        <button
          class="slot__action"
          [class.slot__action--active-done]="slot.done"
          (click)="doneToggle.emit(time)"
          title="Marcar como completado"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .slot {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      background: var(--surface-1);
      box-shadow: 0 1px 2px rgb(0 0 0 / .04);
      transition: border-color 0.15s, background 0.15s, opacity 0.15s;
    }
    .slot:hover { border-color: var(--brand-400); }
    .slot--done {
      background: var(--surface-2);
      border-color: var(--border);
      opacity: 0.65;
    }
    .slot--flagged {
      background: rgba(251, 191, 36, 0.06);
      border-color: #fbbf24;
    }

    .slot__time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 5.5rem;
      flex-shrink: 0;
    }
    .slot__time-start {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-1);
    }
    .slot__time-end {
      font-size: 0.65rem;
      color: var(--text-3);
      font-weight: 500;
    }

    .slot__input-wrap { flex: 1; min-width: 0; }
    .slot__input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.8125rem;
      color: var(--text-1);
      font-family: inherit;
    }
    .slot__input::placeholder { color: var(--text-3); }
    .slot__input--done {
      text-decoration: line-through;
      color: var(--text-3);
    }

    .slot__actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }
    .slot__action {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem;
      border: none;
      background: transparent;
      color: var(--text-3);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .slot__action:hover { color: var(--text-2); background: var(--surface-2); }
    .slot__action--active-flag { color: #f59e0b; background: rgba(251,191,36,.12); }
    .slot__action--active-flag:hover { color: #d97706; }
    .slot__action--active-done { color: #10b981; background: rgba(16,185,129,.12); }
    .slot__action--active-done:hover { color: #059669; }
  `]
})
export class TimeSlotItemComponent {
  @Input() time    = '';
  @Input() endTime = '';
  @Input() slot!: TimeSlot;
  @Output() textChange  = new EventEmitter<{ time: string; text: string }>();
  @Output() doneToggle  = new EventEmitter<string>();
  @Output() flagToggle  = new EventEmitter<string>();
}
