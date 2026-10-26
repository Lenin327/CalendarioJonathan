import {
  Component, inject, signal, computed,
  ChangeDetectionStrategy, Input, Output, EventEmitter, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../../core/services/agenda.service';
import { CalendarEvent } from '../../../../core/models/day-data.model';

interface BigDay {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const COLORS = [
  { value: 'blue',   label: 'Azul',     hex: '#3b82f6' },
  { value: 'red',    label: 'Rojo',     hex: '#ef4444' },
  { value: 'green',  label: 'Verde',    hex: '#22c55e' },
  { value: 'yellow', label: 'Amarillo', hex: '#eab308' },
  { value: 'purple', label: 'Morado',   hex: '#a855f7' },
  { value: 'orange', label: 'Naranja',  hex: '#f97316' },
];

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- Backdrop -->
    <div
      class="cdlg-backdrop"
      [class.cdlg-backdrop--open]="open"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-label="Calendario de eventos"
    >
      <!-- Dialog panel -->
      <div class="cdlg" [class.cdlg--open]="open">

        <!-- ─── Dialog header ─────────────────────── -->
        <div class="cdlg__header">
          <div class="cdlg__header-left">
            <div class="cdlg__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 class="cdlg__title">Calendario de Eventos</h2>
              <p class="cdlg__subtitle">Clic en un día para agregar o ver eventos</p>
            </div>
          </div>

          <div class="cdlg__header-right">
            <!-- Month navigation -->
            <button class="cdlg__nav-btn" (click)="prevMonth()" type="button" aria-label="Mes anterior">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="cdlg__month-label">{{ monthLabel() }}</span>
            <button class="cdlg__nav-btn" (click)="nextMonth()" type="button" aria-label="Mes siguiente">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <button class="cdlg__today-btn" (click)="goToday()" type="button">Hoy</button>
            <button class="cdlg__close-btn" (click)="close.emit()" type="button" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ─── Calendar grid ─────────────────────── -->
        <div class="cdlg__body">

          <!-- Weekday labels -->
          <div class="cdlg__weekdays">
            <div *ngFor="let d of weekDays" class="cdlg__wd">{{ d }}</div>
          </div>

          <!-- Day cells -->
          <div class="cdlg__grid">
            <div
              *ngFor="let day of calDays(); trackBy: trackByKey"
              class="cdlg__cell"
              [class.cdlg__cell--other]="!day.isCurrentMonth"
              [class.cdlg__cell--today]="day.isToday"
              [class.cdlg__cell--selected]="selectedDate() === day.dateKey"
              (click)="selectDate(day.dateKey)"
              role="button"
              [attr.aria-label]="'Día ' + day.day"
              tabindex="0"
            >
              <!-- Day number -->
              <div class="cdlg__day-header">
                <span class="cdlg__day-num">{{ day.day }}</span>
                <span *ngIf="day.events.length > 0" class="cdlg__event-count">
                  {{ day.events.length }}
                </span>
              </div>

              <!-- Events -->
              <div class="cdlg__day-events">
                <div
                  *ngFor="let ev of day.events.slice(0, 3)"
                  class="cdlg__ev-chip cdlg__ev-chip--{{ ev.color || 'blue' }}"
                  [title]="ev.title"
                >
                  <span class="cdlg__ev-chip-dot"></span>
                  <span class="cdlg__ev-chip-label">{{ ev.title }}</span>
                </div>
                <div *ngIf="day.events.length > 3" class="cdlg__ev-more">
                  +{{ day.events.length - 3 }} más
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Side panel: add event for selected day ─ -->
        <div class="cdlg__panel" [class.cdlg__panel--open]="selectedDate()">

          <ng-container *ngIf="selectedDate() as date">
            <!-- Panel header -->
            <div class="cdlg__panel-header">
              <div>
                <p class="cdlg__panel-date">{{ formatDate(date) }}</p>
                <p class="cdlg__panel-hint">Eventos del día</p>
              </div>
              <button class="cdlg__panel-agenda-btn" (click)="gotoAgenda(date)" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                Ver agenda
              </button>
            </div>

            <!-- Events list -->
            <div class="cdlg__panel-events">
              <div *ngIf="eventsFor(date).length === 0" class="cdlg__panel-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                  style="color: var(--text-3)">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>No hay eventos</span>
              </div>

              <div
                *ngFor="let ev of eventsFor(date); trackBy: trackById"
                class="cdlg__panel-ev-item"
              >
                <span class="cdlg__panel-ev-dot cdlg__panel-ev-dot--{{ ev.color || 'blue' }}"></span>
                <span class="cdlg__panel-ev-title">{{ ev.title }}</span>
                <button
                  class="cdlg__panel-ev-del"
                  (click)="removeEvent(date, ev.id)"
                  type="button"
                  aria-label="Eliminar evento"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add event form -->
            <form class="cdlg__panel-form" (ngSubmit)="addEvent(date)">
              <p class="cdlg__panel-form-label">Nuevo evento</p>
              <input
                type="text"
                class="cdlg__panel-input"
                placeholder="Ej: Examen de Cálculo, Cita médica..."
                [(ngModel)]="newTitle"
                name="newTitle"
                maxlength="80"
                autocomplete="off"
              >
              <!-- Color selection -->
              <div class="cdlg__panel-colors">
                <button
                  *ngFor="let c of colors"
                  type="button"
                  class="cdlg__panel-color"
                  [style.background]="c.hex"
                  [class.cdlg__panel-color--active]="selectedColor === c.value"
                  (click)="selectedColor = c.value"
                  [title]="c.label"
                ></button>
              </div>
              <button
                type="submit"
                class="cdlg__panel-submit"
                [disabled]="!newTitle.trim()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Agregar evento
              </button>
            </form>
          </ng-container>

          <!-- Placeholder when no day selected -->
          <div *ngIf="!selectedDate()" class="cdlg__panel-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>Selecciona un día<br>para ver o agregar eventos</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styleUrl: './calendar-dialog.component.css'
})
export class CalendarDialogComponent {
  agenda = inject(AgendaService);

  @Input() open = false;
  @Output() close       = new EventEmitter<void>();
  @Output() daySelected = new EventEmitter<string>();

  readonly weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly colors   = COLORS;

  private viewYear  = signal<number>(new Date().getFullYear());
  private viewMonth = signal<number>(new Date().getMonth());
  selectedDate      = signal<string>('');
  newTitle          = '';
  selectedColor     = 'blue';

  readonly monthLabel = computed(() => {
    const d = new Date(this.viewYear(), this.viewMonth(), 1);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  });

  readonly calDays = computed((): BigDay[] => {
    const year     = this.viewYear();
    const month    = this.viewMonth();
    const todayKey = this.agenda.getTodayKey();

    const firstDay      = new Date(year, month, 1);
    const startDow      = (firstDay.getDay() + 6) % 7;
    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const daysInPrevMon = new Date(year, month, 0).getDate();
    const list: BigDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = daysInPrevMon - i;
      const dk = this.key(year, month - 1, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: false, isToday: dk === todayKey,
        events: this.agenda.getEventsForDate(dk) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = this.key(year, month, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: true, isToday: dk === todayKey,
        events: this.agenda.getEventsForDate(dk) });
    }
    const rem = (7 - (list.length % 7)) % 7;
    for (let d = 1; d <= rem; d++) {
      const dk = this.key(year, month + 1, d);
      list.push({ dateKey: dk, day: d, isCurrentMonth: false, isToday: dk === todayKey,
        events: this.agenda.getEventsForDate(dk) });
    }
    return list;
  });

  // ── Navigation ──────────────────────────────────
  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else { this.viewMonth.update(m => m - 1); }
  }
  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else { this.viewMonth.update(m => m + 1); }
  }
  goToday(): void {
    const t = new Date();
    this.viewYear.set(t.getFullYear());
    this.viewMonth.set(t.getMonth());
    this.selectedDate.set(this.agenda.getTodayKey());
  }

  // ── Day selection ────────────────────────────────
  selectDate(dateKey: string): void {
    this.selectedDate.set(dateKey);
    this.newTitle = '';
    this.selectedColor = 'blue';
  }

  gotoAgenda(dateKey: string): void {
    this.agenda.loadDay(dateKey);
    this.daySelected.emit(dateKey);
    this.close.emit();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Events ──────────────────────────────────────
  eventsFor(dateKey: string): CalendarEvent[] {
    return this.agenda.getEventsForDate(dateKey);
  }

  addEvent(dateKey: string): void {
    if (!this.newTitle.trim()) return;
    this.agenda.addEvent(dateKey, this.newTitle, this.selectedColor);
    this.newTitle = '';
  }

  removeEvent(dateKey: string, id: string): void {
    this.agenda.removeEvent(dateKey, id);
  }

  // ── Backdrop / keyboard ──────────────────────────
  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('cdlg-backdrop')) this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.open) this.close.emit(); }

  // ── Helpers ─────────────────────────────────────
  formatDate(dateKey: string): string {
    const [y, m, d] = dateKey.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  trackByKey(_: number, d: BigDay): string        { return d.dateKey; }
  trackById (_: number, e: CalendarEvent): string { return e.id; }

  private key(year: number, month: number, day: number): string {
    return new Date(year, month, day).toISOString().split('T')[0];
  }
}
