import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom, APP_INITIALIZER, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/modules/login/login.component';
import { DashboardComponent } from './app/modules/dashboard/dashboard.component';
import { UsersComponent } from './app/modules/users/users.component';
import { ConfirmAttendanceComponent } from './app/modules/attendance/confirm-attendance/confirm-attendance.component';
import { AuthInterceptor } from './app/core/auth.interceptor';
import { LanguageInterceptor } from './app/core/language.interceptor';
import { routes as appRoutes } from './app/app.routes';
import { LanguageService } from './app/services/language.service';

// Re-adding the local routes definition as per user request
const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  // Pointing to EventsModule again, to investigate its flow
  { path: 'events', loadChildren: () => import('./app/modules/events/events.module').then(m => m.EventsModule) }, 
  { path: 'affiliates', loadChildren: () => import('./app/modules/affiliates/affiliates.module').then(m => m.AffiliatesModule) },
  { path: 'users', component: UsersComponent },
  { path: 'confirm-attendance/:token', component: ConfirmAttendanceComponent },
  { path: '**', redirectTo: '' }
];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export function appInitializerFactory(translate: TranslateService, injector: Injector): () => Promise<any> {
  return () => new Promise<any>((resolve: any) => {
    console.log('APP_INITIALIZER: Initializing language...');
    const languageService = injector.get(LanguageService);
    const storedLanguage = languageService.getCurrentLanguage();
    console.log(`APP_INITIALIZER: Language from LanguageService (localStorage): ${storedLanguage}`);

    translate.setDefaultLang('en');
    
    console.log(`APP_INITIALIZER: Attempting translate.use('${storedLanguage}')`);
    firstValueFrom(translate.use(storedLanguage)).then(() => {
      console.log(`APP_INITIALIZER: Successfully initialized '${storedLanguage}' language.`);
      resolve(null);
    }).catch(error => {
      console.error(`APP_INITIALIZER: Problem with '${storedLanguage}' language initialization.`, error);
      console.log(`APP_INITIALIZER: Falling back to 'en'.`);
      firstValueFrom(translate.use('en')).then(() => {
        console.warn(`APP_INITIALIZER: Fallback to 'en' language succeeded.`);
        resolve(null);
      }).catch(fallbackError => {
        console.error(`APP_INITIALIZER: Problem with default 'en' language initialization.`, fallbackError);
        resolve(null);
      });
    });
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    // Reverting to use the local routes definition
    provideRouter(routes), 
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    TranslateService,
    LanguageService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ]
}).catch(err => console.error(err));
