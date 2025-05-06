import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet

@Component({
  selector: 'app-affiliates', // Changed selector to app-affiliates
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet // Import RouterOutlet here
  ],
  templateUrl: './affiliates.component.html',
  styleUrls: ['./affiliates.component.css']
})
export class AffiliatesComponent {
  // This component might be very simple, primarily acting as a layout shell
  // with the <router-outlet> for its children.
} 