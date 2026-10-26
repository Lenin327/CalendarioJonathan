import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DayData } from '../models/day-data.model';
import { environment } from '../../../environments/environment';

/**
 * ApiService
 * ---------------------------------------------------------
 * Gestiona todas las llamadas HTTP al backend AWS.
 * Endpoints:
 *   GET    /agenda/{date}   → Obtener datos del día
 *   PUT    /agenda/{date}   → Guardar datos del día
 *   DELETE /agenda/{date}   → Eliminar datos del día
 *
 * Si `environment.useLocalStorage = true`, trabaja en modo
 * offline usando LocalStorage como fallback.
 * ---------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;          // AWS API Gateway URL
  private readonly userId   = environment.userId;          // "user#jonathan" (sin auth)

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
    });
  }

  /** Obtiene los datos de un día desde la API */
  getDayData(dateKey: string): Observable<DayData | null> {
    if (environment.useLocalStorage) {
      return of(this.localGet(dateKey));
    }
    return this.http
      .get<DayData>(`${this.baseUrl}/agenda/${dateKey}`, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.warn('[ApiService] GET fallback to localStorage', err);
          return of(this.localGet(dateKey));
        })
      );
  }

  /** Guarda los datos de un día en la API */
  saveDayData(dateKey: string, data: DayData): Observable<DayData> {
    if (environment.useLocalStorage) {
      this.localSet(dateKey, data);
      return of(data);
    }
    return this.http
      .put<DayData>(
        `${this.baseUrl}/agenda/${dateKey}`,
        { ...data, updatedAt: new Date().toISOString() },
        { headers: this.headers }
      )
      .pipe(
        tap(saved => this.localSet(dateKey, saved)),     // cache local
        catchError(err => {
          console.warn('[ApiService] PUT fallback to localStorage', err);
          this.localSet(dateKey, data);
          return of(data);
        })
      );
  }

  /** Elimina los datos de un día */
  deleteDayData(dateKey: string): Observable<void> {
    this.localDelete(dateKey);
    if (environment.useLocalStorage) {
      return of(undefined);
    }
    return this.http
      .delete<void>(`${this.baseUrl}/agenda/${dateKey}`, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.warn('[ApiService] DELETE error', err);
          return of(undefined);
        })
      );
  }

  // ─── LocalStorage helpers ────────────────────────────────
  private readonly LS_KEY = 'agenda_30min_data_v2';

  private localGet(dateKey: string): DayData | null {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return null;
      const all = JSON.parse(raw) as Record<string, DayData>;
      return all[dateKey] ?? null;
    } catch {
      return null;
    }
  }

  private localSet(dateKey: string, data: DayData): void {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      const all: Record<string, DayData> = raw ? JSON.parse(raw) : {};
      all[dateKey] = data;
      localStorage.setItem(this.LS_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('[ApiService] localStorage write error', e);
    }
  }

  private localDelete(dateKey: string): void {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return;
      const all: Record<string, DayData> = JSON.parse(raw);
      delete all[dateKey];
      localStorage.setItem(this.LS_KEY, JSON.stringify(all));
    } catch {}
  }

  /** Exporta todos los datos locales como objeto (para backup) */
  exportAllLocal(): Record<string, DayData> {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** Importa un objeto completo de datos */
  importAllLocal(data: Record<string, DayData>): void {
    localStorage.setItem(this.LS_KEY, JSON.stringify(data));
  }
}
