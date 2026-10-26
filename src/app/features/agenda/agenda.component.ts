import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../core/services/agenda.service';
import { ThemeService } from '../../core/services/theme.service';
import { HeaderComponent } from '../../shared/components/organisms/header/header.component';
import { TimeBlocksComponent } from '../../shared/components/organisms/time-blocks/time-blocks.component';
import { TasksPanelComponent } from '../../shared/components/organisms/tasks-panel/tasks-panel.component';
import { NotesPanelComponent } from '../../shared/components/organisms/notes-panel/notes-panel.component';
import { CalendarComponent } from '../../shared/components/organisms/calendar/calendar.component';
import { CalendarDialogComponent } from '../../shared/components/organisms/calendar/calendar-dialog.component';
import { SyncModalComponent } from '../../shared/components/organisms/sync-modal/sync-modal.component';
import { ToastComponent } from '../../shared/components/atoms/toast/toast.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TimeBlocksComponent,
    TasksPanelComponent,
    NotesPanelComponent,
    CalendarComponent,
    CalendarDialogComponent,
    SyncModalComponent,
    ToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <app-header (openSync)="syncOpen.set(true)" />

    <!-- Sub-header -->
    <div class="agenda__subheader">
      <div class="agenda__subheader-inner">
        <span class="agenda__date-label">{{ agenda.formatDisplayDate(agenda.currentDateKey()) }}</span>
        <div class="agenda__prog-wrap">
          <span class="agenda__prog-label">
            Bloques: <strong>{{ agenda.filledSlots() }}/{{ agenda.TIME_SLOTS.length }}</strong>
          </span>
          <div class="agenda__prog-bar">
            <div class="agenda__prog-fill"
              [style.width.%]="(agenda.filledSlots() / agenda.TIME_SLOTS.length) * 100">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <main class="agenda__main">
      <div class="agenda__layout">

        <div class="agenda__col-main">
          <app-time-blocks />
        </div>

        <aside class="agenda__sidebar">
          <!-- Mini calendar: click "Abrir" → opens big dialog -->
          <app-calendar
            (daySelected)="onDaySelected()"
            (openDialog)="calendarOpen.set(true)"
          />
          <app-tasks-panel />
          <app-notes-panel />
        </aside>

      </div>
    </main>

    <!-- Full-screen Calendar Dialog -->
    <app-calendar-dialog
      [open]="calendarOpen()"
      (close)="calendarOpen.set(false)"
      (daySelected)="onDaySelected()"
    />

    <!-- Sync Modal -->
    <app-sync-modal
      [open]="syncOpen()"
      (close)="syncOpen.set(false)"
      (toasted)="showToast($event)"
    />

    <!-- Toast -->
    <app-toast [message]="toastMsg()" [trigger]="toastTrigger()" />
  `,
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  agenda = inject(AgendaService);
  theme  = inject(ThemeService);

  calendarOpen = signal(false);
  syncOpen     = signal(false);
  toastMsg     = signal('');
  toastTrigger = signal(0);

  ngOnInit(): void {
    this.theme.apply();
    this.agenda.loadDay(this.agenda.getTodayKey());
  }

  onDaySelected(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg);
    this.toastTrigger.update(n => n + 1);
  }
}
