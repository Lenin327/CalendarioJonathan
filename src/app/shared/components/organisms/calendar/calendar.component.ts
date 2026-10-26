import {
  Component, inject, signal, computed, ChangeDetectionStrategy, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../../../core/services/agenda.service';

interface MiniDay {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="mini-cal">
      <!-- Header -->
      <div class="mini-cal__header">
        <div class="mini-cal__title-row">
          <div class="mini-cal__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2 class="mini-cal__title">Calendario</h2>
        </div>
        <button class="mini-cal__open-btn" (click)="openDialog.emit()" type="button" title="Abrir calendario completo">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          Abrir
        </button>
      </div>

      <!-- Month nav -->
      <div class="mini-cal__nav">
        <button class="mini-cal__nav-btn" (click)="prevMonth()" type="button" aria-label="Mes anterior">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="mini-cal__month-label">{{ monthLabel() }}</span>
        <button class="mini-cal__nav-btn" (click)="nextMonth()" type="button" aria-label="Mes siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- Weekdays -->
      <div class="mini-cal__weekdays">
        <span *ngFor="let d of weekDays">{{ d }}</span>
      </div>

      <!-- Grid -->
      <div class="mini-cal__grid">
        <button
          *ngFor="let day of days(); trackBy: trackByKey"
          class="mini-cal__day"
          [class.mini-cal__day--other]="!day.isCurrentMonth"
          [class.mini-cal__day--today]="day.isToday"
          [class.mini-cal__day--selected]="day.dateKey === agenda.currentDateKey()"
          (click)="selectDay(day.dateKey)"
          [attr.aria-label]="day.dateKey"
          type="button"
        >
          <span class="mini-cal__day-num">{{ day.day }}</span>
          <!-- Pin icon when day has events -->
          <span *ngIf="day.hasEvents" class="mini-cal__pin" aria-label="Tiene eventos">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24"
              fill="currentColor" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </span>
        </button>
      </div>

      <!-- Footer CTA -->
      <button class="mini-cal__cta" (click)="openDialog.emit()" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Agregar evento al calendario
      </button>
    </div>
  `,
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  agenda = inject(AgendaService);

  @Output() daySelected = new EventEmitter<string>();
  @Output() openDialog  = new EventEmitter<void>();

  readonly weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  private viewYear  = signal<number>(new Date().getFullYear());
  private viewMonth = signal<number>(new Date().getMonth());

  readonly monthLabel = computed(() => {
    const d = new Date(this.viewYear(), this.viewMonth(), 1);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  readonly days = computed((): MiniDay[] => {
    const year     = this.viewYear();
    const month    = this.viewMonth();
    const todayKey = this.agenda.getTodayKey();

    const firstDay      = new Date(year, month, 1);
    const startDow      = (firstDay.getDay() + 6) % 7;
    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const daysInPrevMon = new Date(year, month, 0).getDate();
    const list: MiniDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = daysInPrevMon - i;
      const dk = this.key(year, month - 1, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: false, isToday: dk === todayKey,
        hasEvents: this.agenda.getEventsForDate(dk).length > 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = this.key(year, month, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: true, isToday: dk === todayKey,
        hasEvents: this.agenda.getEventsForDate(dk).length > 0 });
    }
    const rem = (7 - (list.length % 7)) % 7;
    for (let d = 1; d <= rem; d++) {
      const dk = this.key(year, month + 1, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: false, isToday: dk === todayKey,
        hasEvents: this.agenda.getEventsForDate(dk).length > 0 });
    }
    return list;
  });

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else { this.viewMonth.update(m => m - 1); }
  }
  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else { this.viewMonth.update(m => m + 1); }
  }

  selectDay(dateKey: string): void {
    this.agenda.loadDay(dateKey);
    this.daySelected.emit(dateKey);
  }

  trackByKey(_: number, d: MiniDay): string { return d.dateKey; }

  private key(year: number, month: number, day: number): string {
    return new Date(year, month, day).toISOString().split('T')[0];
  }
}
