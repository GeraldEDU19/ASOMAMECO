import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="events-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .events-shell {
      min-height: 100vh;
      background-color: var(--gray-ultralight);
    }
  `]
})
export class EventsComponent {}
