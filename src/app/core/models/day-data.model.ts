import { TimeSlot } from './time-slot.model';
import { Task } from './task.model';

export interface CalendarEvent {
  id: string;
  title: string;       // ej: "Examen de Cálculo"
  color?: string;      // 'blue' | 'red' | 'green' | 'yellow' | 'purple'
  createdAt?: string;
}

export interface DayData {
  slots: Record<string, TimeSlot>; // key = "09:00"
  tasks: Task[];
  notes: string;
  events: CalendarEvent[];         // Eventos visibles en el calendario
  updatedAt?: string;
}

export interface AgendaState {
  [dateKey: string]: DayData; // key = "2026-10-26"
}
