// src/app/app.component.ts
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HeaderComponent } from './shared/header/header.component';
import { TokenService } from './modules/services/token.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private loadingService = inject(LoadingService);
  private cdr = inject(ChangeDetectorRef);
  
  showHeader = false;
  loading$ = this.loadingService.loading$;

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        switchMap((e: NavigationEnd) => {
          const skip = ['/', '/forgot-password', '/reset-password']
            .includes(e.urlAfterRedirects);
          this.showHeader = !skip;
          this.cdr.detectChanges(); // Forzar la detección de cambios
          return skip ? of(true) : this.tokenService.validate();
        })
      )
      .subscribe(valid => {
        if (!valid) this.router.navigate(['/']);
      });
  }
}
