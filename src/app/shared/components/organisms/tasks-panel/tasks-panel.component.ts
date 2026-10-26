import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../../core/services/agenda.service';
import { TaskItemComponent } from '../../molecules/task-item/task-item.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-tasks-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskItemComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <section class="tasks-panel">
      <!-- Header -->
      <div class="tasks-panel__header">
        <div class="tasks-panel__title-wrap">
          <div class="tasks-panel__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h2 class="tasks-panel__title">Tareas del Día</h2>
        </div>
        <app-badge
          [label]="agenda.completedTasks() + '/' + agenda.dayData().tasks.length"
          [color]="agenda.completedTasks() === agenda.dayData().tasks.length && agenda.dayData().tasks.length > 0 ? 'success' : 'default'"
        />
      </div>

      <!-- Add Task Form -->
      <form class="tasks-panel__form" (ngSubmit)="onAddTask()" #taskForm="ngForm">
        <input
          type="text"
          class="tasks-panel__input"
          placeholder="Añadir una tarea..."
          [(ngModel)]="newTaskText"
          name="newTask"
          autocomplete="off"
          aria-label="Añadir una tarea"
        >
        <button
          type="submit"
          class="tasks-panel__add-btn"
          aria-label="Agregar tarea"
          [disabled]="!newTaskText.trim()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </form>

      <!-- Tasks List -->
      <div class="tasks-panel__list">
        <ng-container *ngIf="agenda.dayData().tasks.length === 0">
          <div class="tasks-panel__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p>No hay tareas pendientes para hoy.</p>
          </div>
        </ng-container>

        <app-task-item
          *ngFor="let task of agenda.dayData().tasks; trackBy: trackById"
          [task]="task"
          (toggle)="agenda.toggleTaskDone($event)"
          (delete)="agenda.deleteTask($event)"
        />
      </div>
    </section>
  `,
  styleUrl: './tasks-panel.component.css'
})
export class TasksPanelComponent {
  agenda = inject(AgendaService);
  newTaskText = '';

  trackById(_: number, task: { id: string }): string { return task.id; }

  onAddTask(): void {
    if (!this.newTaskText.trim()) return;
    this.agenda.addTask(this.newTaskText);
    this.newTaskText = '';
  }
}
