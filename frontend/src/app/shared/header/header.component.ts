// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fs-3" routerLink="/dashboard">ASOMAMECO</a>
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item mx-3">
            <a class="nav-link fs-5 fw-semibold" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          </li>
          <li class="nav-item mx-3">
            <a class="nav-link fs-5 fw-semibold" routerLink="/events"    routerLinkActive="active">Eventos</a>
          </li>
          <li class="nav-item mx-3">
            <a class="nav-link fs-5 fw-semibold" routerLink="/affiliate" routerLinkActive="active">Afiliados</a>
          </li>
          <li class="nav-item mx-3">
            <a class="nav-link fs-5 fw-semibold" routerLink="/users"     routerLinkActive="active">Usuarios</a>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class HeaderComponent {}
