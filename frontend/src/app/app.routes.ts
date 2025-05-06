import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.routes').then(m => m.eventsRoutes)
  },
  {
    path: 'affiliates',
    loadChildren: () => import('./modules/affiliates/affiliates.module').then(m => m.AffiliatesModule)
  },
  {
    path: '',
    redirectTo: 'events/list',
    pathMatch: 'full'
  }
]; 