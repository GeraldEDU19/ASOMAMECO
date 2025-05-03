import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.module').then(m => m.EventsModule)
  },
  {
    path: '',
    redirectTo: 'events/list',
    pathMatch: 'full'
  }
]; 