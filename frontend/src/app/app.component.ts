// src/app/app.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HeaderComponent } from './shared/header/header.component';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterOutlet],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  private router      = inject(Router);
  private tokenService= inject(TokenService);
  showHeader           = false;

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        switchMap((e: NavigationEnd) => {
          const skip = ['/', '/forgot-password', '/reset-password']
            .includes(e.urlAfterRedirects);
          this.showHeader = !skip;
          return skip ? of(true) : this.tokenService.validate();
        })
      )
      .subscribe(valid => {
        if (!valid) this.router.navigate(['/']);
      });
  }
}
