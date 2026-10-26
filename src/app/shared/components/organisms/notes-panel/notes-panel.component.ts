import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../../core/services/agenda.service';

@Component({
  selector: 'app-notes-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <section class="notes-panel">
      <div class="notes-panel__header">
        <div class="notes-panel__title-wrap">
          <div class="notes-panel__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 class="notes-panel__title">Apuntes del Día</h2>
        </div>

        <div class="notes-panel__save-indicator" [class.notes-panel__save-indicator--visible]="agenda.isSaving()">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Guardado
        </div>
      </div>

      <textarea
        class="notes-panel__textarea"
        placeholder="Escribe aquí ideas, reflexiones, resumen del día o recordatorios..."
        [ngModel]="agenda.dayData().notes"
        (ngModelChange)="onNotesChange($event)"
        aria-label="Apuntes del día"
      ></textarea>
    </section>
  `,
  styleUrl: './notes-panel.component.css'
})
export class NotesPanelComponent {
  agenda = inject(AgendaService);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onNotesChange(value: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.agenda.updateNotes(value);
    }, 400);
  }
}
