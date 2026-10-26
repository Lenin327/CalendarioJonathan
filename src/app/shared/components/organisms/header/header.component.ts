import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../../../core/services/agenda.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { DateNavigatorComponent } from '../../molecules/date-navigator/date-navigator.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DateNavigatorComponent],
  template: `
    <header class="header">
      <div class="header__inner">

        <!-- Logo -->
        <div class="header__brand">
          <div class="header__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h1 class="header__title">Mi Agenda Diaria</h1>
            <p class="header__subtitle">Planificador de bloques de 30 min</p>
          </div>
        </div>

        <!-- Date Navigator -->
        <app-date-navigator
          [currentDate]="agenda.currentDateKey()"
          (prev)="onPrev()"
          (next)="onNext()"
          (today)="onToday()"
          (dateChange)="onDateChange($event)"
        />

        <!-- Actions -->
        <div class="header__actions">
          <!-- Toggle Theme -->
          <button class="header__action-btn" (click)="theme.toggle()" title="Cambiar tema" aria-label="Cambiar tema">
            <svg *ngIf="!theme.isDark()" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg *ngIf="theme.isDark()" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>

          <!-- Sync Button -->
          <button class="header__sync-btn" (click)="openSync.emit()" title="Sincronizar / Exportar" aria-label="Sincronizar datos">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span class="header__sync-label">Sincronizar</span>
          </button>
        </div>

      </div>
    </header>
  `,
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  agenda = inject(AgendaService);
  theme  = inject(ThemeService);
  @Output() openSync = new EventEmitter<void>();

  onPrev()  { this.agenda.loadDay(this.agenda.shiftDay(-1)); }
  onNext()  { this.agenda.loadDay(this.agenda.shiftDay(1));  }
  onToday() { this.agenda.loadDay(this.agenda.getTodayKey()); }
  onDateChange(date: string) { if (date) this.agenda.loadDay(date); }
}
