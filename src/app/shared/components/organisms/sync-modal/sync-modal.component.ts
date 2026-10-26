import {
  Component, inject, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../../core/services/agenda.service';
import { ConfirmDialogComponent } from '../../atoms/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sync-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div
      class="modal-backdrop"
      [class.modal-backdrop--open]="open"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-label="Sincronización y respaldo"
    >
      <div class="modal" [class.modal--open]="open">
        <!-- Header -->
        <div class="modal__header">
          <div class="modal__title-wrap">
            <div class="modal__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </div>
            <div>
              <h3 class="modal__title">Sincronización &amp; Respaldo</h3>
              <p class="modal__subtitle">Exporta o importa tus datos de agenda</p>
            </div>
          </div>
          <button class="modal__close" (click)="close.emit()" aria-label="Cerrar" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal__body">

          <!-- Opción A: JSON -->
          <div class="modal__section">
            <p class="modal__section-label">Opción A — Archivo de respaldo (.json)</p>
            <div class="modal__row">
              <button class="modal__btn modal__btn--primary" (click)="onExport()" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar JSON
              </button>
              <label class="modal__btn modal__btn--secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Importar JSON
                <input type="file" accept=".json" class="modal__file-input" (change)="onImportFile($event)">
              </label>
            </div>
          </div>

          <!-- Opción B: Portapapeles -->
          <div class="modal__section">
            <p class="modal__section-label">Opción B — Copiar / Pegar código (sincronización rápida)</p>
            <button class="modal__btn modal__btn--dark" (click)="onCopyClipboard()" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copiar todo al portapapeles
            </button>
            <div class="modal__paste-row">
              <input
                type="text"
                class="modal__paste-input"
                placeholder="Pega el código aquí..."
                [(ngModel)]="pasteCode"
                name="pasteCode"
              >
              <button class="modal__btn modal__btn--success" (click)="onPasteImport()" type="button">
                Restaurar
              </button>
            </div>
          </div>

          <!-- Tip -->
          <p class="modal__tip">
            💡 Usa "Exportar JSON" para hacer respaldos y "Importar JSON" para restaurar en otro dispositivo.
          </p>
        </div>

        <!-- Footer -->
        <div class="modal__footer">
          <button class="modal__btn modal__btn--ghost" (click)="close.emit()" type="button">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Confirm dialog para import (reemplaza confirm() nativo) -->
    <app-confirm-dialog
      #confirmImport
      (confirmed)="executeImport()"
      (cancelled)="pendingData = null"
    />
  `,
  styleUrl: './sync-modal.component.css'
})
export class SyncModalComponent {
  agenda = inject(AgendaService);

  @Input() open = false;
  @Output() close   = new EventEmitter<void>();
  @Output() toasted = new EventEmitter<string>();

  @ViewChild('confirmImport') confirmImport!: ConfirmDialogComponent;

  pasteCode   = '';
  pendingData: Record<string, unknown> | null = null;

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onExport(): void {
    const data = this.agenda.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `agenda_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toasted.emit('Respaldo JSON descargado ✓');
    this.close.emit();
  }

  onImportFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target!.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          this.pendingData = parsed;
          this.confirmImport.show({
            title: '¿Importar datos?',
            message: 'Se reemplazarán todos tus datos actuales con este archivo de respaldo.',
            confirmLabel: 'Sí, importar',
            danger: true
          });
        }
      } catch {
        this.toasted.emit('Error: formato de archivo inválido');
      }
    };
    reader.readAsText(file);
  }

  executeImport(): void {
    if (!this.pendingData) return;
    this.agenda.importAllData(this.pendingData as never);
    this.pendingData = null;
    this.toasted.emit('¡Datos importados con éxito! ✓');
    this.close.emit();
  }

  onCopyClipboard(): void {
    const data = JSON.stringify(this.agenda.exportAllData());
    navigator.clipboard.writeText(data)
      .then(() => this.toasted.emit('¡Datos copiados al portapapeles! ✓'))
      .catch(() => this.toasted.emit('No se pudo copiar. Intenta manualmente.'));
  }

  onPasteImport(): void {
    if (!this.pasteCode.trim()) return;
    try {
      const parsed = JSON.parse(this.pasteCode.trim());
      if (typeof parsed === 'object') {
        this.agenda.importAllData(parsed);
        this.pasteCode = '';
        this.toasted.emit('¡Agenda sincronizada y cargada! ✓');
        this.close.emit();
      }
    } catch {
      this.toasted.emit('El código ingresado no es válido');
    }
  }
}
