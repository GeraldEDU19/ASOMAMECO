import { Routes } from '@angular/router';
import { EventsListComponent } from './events-list/events-list.component';
import { EventsViewComponent } from './events-view/events-view.component';
import { EventsFormComponent } from './events-form/events-form.component';

export const eventsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: EventsListComponent
  },
  {
    path: 'create',
    component: EventsFormComponent
  },
  {
    path: 'view/:id',
    component: EventsViewComponent
  },
  {
    path: 'edit/:id',
    component: EventsFormComponent
  }
]; 