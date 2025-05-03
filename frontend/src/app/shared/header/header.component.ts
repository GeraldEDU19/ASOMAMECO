// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="main-header">
      <div class="header-content">
        <button class="menu-toggle" (click)="menuOpen = !menuOpen" aria-label="Menú" type="button">
          <span [class.open]="menuOpen">☰</span>
        </button>
        <div class="brand-center">
          <a class="brand" routerLink="/dashboard">ASOMAMECO</a>
        </div>
        <div class="user-avatar" title="Usuario">
          <span>👤</span>
        </div>
      </div>
      <nav class="nav-links-wrapper" [class.open]="menuOpen" (click)="$event.stopPropagation()">
        <div class="menu-user-section">
          <div class="menu-user-info">
            <span class="menu-user-avatar">👤</span>
            <span class="menu-user-name">Usuario</span>
          </div>
          <button class="menu-logout-btn" (click)="logout()">Cerrar sesión</button>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">Dashboard</a>
          <a routerLink="/events"    routerLinkActive="active" (click)="closeMenu()">Eventos</a>
          <a routerLink="/affiliate" routerLinkActive="active" (click)="closeMenu()">Afiliados</a>
          <a routerLink="/users"     routerLinkActive="active" (click)="closeMenu()">Usuarios</a>
        </div>
      </nav>
      <div class="menu-backdrop" *ngIf="menuOpen" (click)="closeMenu()"></div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  userMenuOpen = false;

  closeMenu() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }
  logout() {
    // Aquí iría la lógica real de logout
    this.closeMenu();
    alert('Sesión cerrada');
  }
}
