import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-item" [class.task-item--done]="task.done">
      <label class="task-item__check-wrap" [for]="'task-' + task.id">
        <input
          type="checkbox"
          [id]="'task-' + task.id"
          [checked]="task.done"
          (change)="toggle.emit(task.id)"
          class="task-item__checkbox"
        >
        <span class="task-item__check-box">
          <svg *ngIf="task.done" xmlns="http://www.w3.org/2000/svg" width="11" height="11"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </label>
      <span class="task-item__text">{{ task.text }}</span>
      <button
        class="task-item__delete"
        (click)="delete.emit(task.id)"
        title="Eliminar tarea"
        aria-label="Eliminar tarea"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      border-radius: 0.75rem;
      background: var(--surface-2);
      transition: background 0.15s;
    }
    .task-item:hover { background: var(--surface-3); }
    .task-item--done { opacity: 0.6; }

    .task-item__check-wrap {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .task-item__checkbox { display: none; }
    .task-item__check-box {
      width: 1.1rem;
      height: 1.1rem;
      border-radius: 0.375rem;
      border: 2px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #fff;
      transition: all 0.15s;
    }
    .task-item__checkbox:checked + .task-item__check-box {
      background: var(--brand-600);
      border-color: var(--brand-600);
    }

    .task-item__text {
      flex: 1;
      font-size: 0.8125rem;
      color: var(--text-1);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .task-item--done .task-item__text {
      text-decoration: line-through;
      color: var(--text-3);
    }

    .task-item__delete {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border: none;
      background: transparent;
      color: var(--text-3);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .task-item__delete:hover { background: #fee2e2; color: #ef4444; }
  `]
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
