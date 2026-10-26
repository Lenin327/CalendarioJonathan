import { Component, inject, ChangeDetectionStrategy, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../../core/services/agenda.service';
import { TimeSlotItemComponent } from '../../molecules/time-slot-item/time-slot-item.component';
import { ConfirmDialogComponent } from '../../atoms/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-time-blocks',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeSlotItemComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <section class="time-blocks">
      <!-- Panel header -->
      <div class="time-blocks__header">
        <div class="time-blocks__title-wrap">
          <div class="time-blocks__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h2 class="time-blocks__title">Bloques de Tiempo</h2>
            <p class="time-blocks__subtitle">06:00 AM – 11:30 PM · bloques de 30 min</p>
          </div>
        </div>
        <button class="time-blocks__clear-btn" (click)="onClear()" type="button" title="Limpiar todos los bloques">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Progress bar -->
      <div class="time-blocks__progress">
        <div class="time-blocks__progress-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Bloques registrados: <strong>{{ agenda.filledSlots() }}/{{ agenda.TIME_SLOTS.length }}</strong></span>
        </div>
        <div class="time-blocks__progress-bar">
          <div
            class="time-blocks__progress-fill"
            [style.width.%]="(agenda.filledSlots() / agenda.TIME_SLOTS.length) * 100"
          ></div>
        </div>
      </div>

      <!-- Slots list -->
      <div class="time-blocks__list">
        <ng-container *ngIf="agenda.isLoading(); else slotsList">
          <div class="time-blocks__loading">
            <div class="time-blocks__spinner"></div>
            <span>Cargando...</span>
          </div>
        </ng-container>
        <ng-template #slotsList>
          <app-time-slot-item
            *ngFor="let time of agenda.TIME_SLOTS; trackBy: trackByTime"
            [time]="time"
            [endTime]="agenda.getEndTime(time)"
            [slot]="agenda.dayData().slots[time] || emptySlot"
            (textChange)="onTextChange($event)"
            (doneToggle)="agenda.toggleSlotDone($event)"
            (flagToggle)="agenda.toggleSlotFlag($event)"
          />
        </ng-template>
      </div>
    </section>

    <!-- Confirm dialog (reemplaza el confirm() nativo) -->
    <app-confirm-dialog
      #confirmClear
      (confirmed)="agenda.clearDaySlots()"
    />
  `,
  styleUrl: './time-blocks.component.css'
})
export class TimeBlocksComponent {
  agenda = inject(AgendaService);

  @ViewChild('confirmClear') confirmClear!: ConfirmDialogComponent;

  readonly emptySlot = { text: '', done: false, flag: false };

  trackByTime(_: number, time: string): string { return time; }

  onTextChange(event: { time: string; text: string }): void {
    this.agenda.updateSlotText(event.time, event.text);
  }

  onClear(): void {
    this.confirmClear.show({
      title: '¿Limpiar bloques?',
      message: 'Se borrarán todos los registros de tiempo de este día. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, limpiar',
      danger: true
    });
  }
}
