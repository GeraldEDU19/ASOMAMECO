import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/auth/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { EventsComponent } from './app/events/events.component';
import { AffiliatesComponent } from './app/affiliates/affiliates.component';
import { UsersComponent } from './app/users/users.component';
import { ConfirmAttendanceComponent } from './app/app/confirm-attendance/confirm-attendance.component';
import { AuthInterceptor } from './app/core/auth.interceptor';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'events', component: EventsComponent },
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
