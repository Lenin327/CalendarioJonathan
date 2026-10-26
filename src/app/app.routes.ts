import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
