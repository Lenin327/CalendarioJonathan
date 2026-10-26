import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.initTheme());

  private initTheme(): boolean {
    if (typeof localStorage === 'undefined') return false;
    if (localStorage['theme'] === 'dark') return true;
    if (localStorage['theme'] === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle(): void {
    const nowDark = !this.isDark();
    this.isDark.set(nowDark);
    if (nowDark) {
      document.documentElement.classList.add('dark');
      localStorage['theme'] = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage['theme'] = 'light';
    }
  }

  apply(): void {
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
