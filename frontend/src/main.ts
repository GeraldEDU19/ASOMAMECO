import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/modules/login/login.component';
import { DashboardComponent } from './app/modules/dashboard/dashboard.component';
import { EventsComponent } from './app/modules/events/events.component';
import { AffiliatesComponent } from './app/modules/affiliates/affiliates.component';
import { UsersComponent } from './app/modules/users/users.component';
import { ConfirmAttendanceComponent } from './app/modules/attendance/confirm-attendance/confirm-attendance.component';
import { AuthInterceptor } from './app/core/auth.interceptor';
import { routes as appRoutes } from './app/app.routes';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'events', loadChildren: () => import('./app/modules/events/events.module').then(m => m.EventsModule) },
  { path: 'affiliate', component: AffiliatesComponent },
  { path: 'users', component: UsersComponent },
  { path: 'confirm-attendance/:token', component: ConfirmAttendanceComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
