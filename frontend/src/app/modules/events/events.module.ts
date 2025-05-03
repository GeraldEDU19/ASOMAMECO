import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsComponent } from './events.component';
import { EventsListComponent } from './events-list/events-list.component';
import { EventsViewComponent } from './events-view/events-view.component';
import { EventsFormComponent } from './events-form/events-form.component';
import { eventsRoutes } from './events.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(eventsRoutes),
    EventsComponent,
    EventsListComponent,
    EventsViewComponent,
    EventsFormComponent
  ]
})
export class EventsModule { } 