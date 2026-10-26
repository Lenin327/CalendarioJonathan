import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { DayData, AgendaState, CalendarEvent } from '../models/day-data.model';
import { Task } from '../models/task.model';
import { TimeSlot } from '../models/time-slot.model';
import { ApiService } from './api.service';

/**
 * AgendaService
 * ---------------------------------------------------------
 * Servicio principal de la aplicación.
 * Gestiona el estado reactivo de la agenda y coordina
 * las operaciones CRUD contra el ApiService.
 * ---------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private api = inject(ApiService);

  // ─── Estado reactivo ─────────────────────────────────────
  readonly currentDateKey = signal<string>(this.getTodayKey());
  readonly isLoading      = signal<boolean>(false);
  readonly isSaving       = signal<boolean>(false);
  readonly dayData        = signal<DayData>(this.emptyDay());
  // Trigger para forzar re-cómputo del calendario cuando cambian eventos
  readonly eventsVersion  = signal<number>(0);

  // Slots de 30 min de 06:00 a 23:30
  readonly TIME_SLOTS: string[] = this.generateTimeSlots();

  // Stats computadas
  readonly filledSlots = computed(() => {
    const slots = this.dayData().slots;
    return this.TIME_SLOTS.filter(t => slots[t]?.text?.trim()).length;
  });

  readonly completedTasks = computed(() =>
    this.dayData().tasks.filter(t => t.done).length
  );

  // ─── Carga de datos ──────────────────────────────────────
  loadDay(dateKey: string): void {
    this.currentDateKey.set(dateKey);
    this.isLoading.set(true);
    this.api.getDayData(dateKey).subscribe({
      next: (data) => {
        this.dayData.set(data ?? this.emptyDay());
        this.isLoading.set(false);
      },
      error: () => {
        this.dayData.set(this.emptyDay());
        this.isLoading.set(false);
      }
    });
  }

  // ─── Time Slots ──────────────────────────────────────────
  updateSlotText(time: string, text: string): void {
    this.patchSlot(time, { text });
    this.saveCurrentDay();
  }

  toggleSlotDone(time: string): void {
    const current = this.dayData().slots[time];
    this.patchSlot(time, { done: !(current?.done ?? false) });
    this.saveCurrentDay();
  }

  toggleSlotFlag(time: string): void {
    const current = this.dayData().slots[time];
    this.patchSlot(time, { flag: !(current?.flag ?? false) });
    this.saveCurrentDay();
  }

  clearDaySlots(): void {
    this.dayData.update(d => ({ ...d, slots: {} }));
    this.saveCurrentDay();
  }

  private patchSlot(time: string, patch: Partial<TimeSlot>): void {
    this.dayData.update(d => {
      const existing = d.slots[time] ?? { text: '', done: false, flag: false };
      return {
        ...d,
        slots: { ...d.slots, [time]: { ...existing, ...patch } }
      };
    });
  }

  // ─── Tasks ───────────────────────────────────────────────
  addTask(text: string): void {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString()
    };
    this.dayData.update(d => ({ ...d, tasks: [...d.tasks, newTask] }));
    this.saveCurrentDay();
  }

  toggleTaskDone(taskId: string): void {
    this.dayData.update(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }));
    this.saveCurrentDay();
  }

  deleteTask(taskId: string): void {
    this.dayData.update(d => ({
      ...d,
      tasks: d.tasks.filter(t => t.id !== taskId)
    }));
    this.saveCurrentDay();
  }

  // ─── Calendar Events ─────────────────────────────────────
  addEvent(dateKey: string, title: string, color = 'blue'): void {
    if (!title.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      color,
      createdAt: new Date().toISOString()
    };
    // We need to load/save for that specific date (may differ from currentDateKey)
    const all = this.api.exportAllLocal();
    const day = all[dateKey] ?? this.emptyDay();
    day.events = [...(day.events || []), newEvent];
    this.api.importAllLocal({ ...all, [dateKey]: day });
    // Bump version → todos los computed que llamen getEventsForDate() se re-ejecutan
    this.eventsVersion.update(v => v + 1);
    // If it's the current day, update signal
    if (dateKey === this.currentDateKey()) {
      this.dayData.update(d => ({ ...d, events: [...(d.events || []), newEvent] }));
    }
    this.saveCurrentDay();
  }

  removeEvent(dateKey: string, eventId: string): void {
    const all = this.api.exportAllLocal();
    const day = all[dateKey] ?? this.emptyDay();
    day.events = (day.events || []).filter(e => e.id !== eventId);
    this.api.importAllLocal({ ...all, [dateKey]: day });
    this.eventsVersion.update(v => v + 1);
    if (dateKey === this.currentDateKey()) {
      this.dayData.update(d => ({ ...d, events: (d.events || []).filter(e => e.id !== eventId) }));
    }
    this.saveCurrentDay();
  }

  getEventsForDate(dateKey: string): CalendarEvent[] {
    this.eventsVersion(); // Crea dependencia reactiva — Angular re-computará cuando version cambie
    const all = this.api.exportAllLocal();
    return all[dateKey]?.events || [];
  }

  updateNotes(notes: string): void {
    this.dayData.update(d => ({ ...d, notes }));
    this.saveCurrentDay();
  }

  // ─── Persistencia ────────────────────────────────────────
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  private saveCurrentDay(): void {
    // Debounce de 400ms para no spamear la API
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.isSaving.set(true);
      this.api.saveDayData(this.currentDateKey(), this.dayData()).subscribe({
        next: () => setTimeout(() => this.isSaving.set(false), 1000),
        error: () => this.isSaving.set(false)
      });
    }, 400);
  }

  // ─── Export / Import ─────────────────────────────────────
  exportAllData(): Record<string, DayData> {
    return this.api.exportAllLocal();
  }

  importAllData(data: Record<string, DayData>): void {
    this.api.importAllLocal(data);
    this.loadDay(this.currentDateKey());
  }

  // ─── Helpers de fecha ────────────────────────────────────
  getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatDisplayDate(dateKey: string): string {
    const [y, m, d] = dateKey.split('-');
    const date = new Date(+y, +m - 1, +d);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  shiftDay(delta: number): string {
    const [y, m, d] = this.currentDateKey().split('-');
    const date = new Date(+y, +m - 1, +d);
    date.setDate(date.getDate() + delta);
    return date.toISOString().split('T')[0];
  }

  getEndTime(time: string): string {
    const [h, min] = time.split(':').map(Number);
    const endMin = min + 30;
    const endH = endMin >= 60 ? h + 1 : h;
    return `${String(endH % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
  }

  hasDayData(dateKey: string): boolean {
    const all = this.api.exportAllLocal();
    const day = all[dateKey];
    if (!day) return false;
    const hasSlots  = Object.values(day.slots  || {}).some(s => s.text?.trim());
    const hasTasks  = (day.tasks  || []).length > 0;
    const hasNotes  = (day.notes  || '').trim().length > 0;
    const hasEvents = (day.events || []).length > 0;
    return hasSlots || hasTasks || hasNotes || hasEvents;
  }

  // ─── Privados ────────────────────────────────────────────
  private emptyDay(): DayData {
    return { slots: {}, tasks: [], notes: '', events: [] };
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 6; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }
}
