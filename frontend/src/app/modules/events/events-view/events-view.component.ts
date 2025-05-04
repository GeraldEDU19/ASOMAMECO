import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { Event, EventResponse } from '../../../models/event.model';
import { LoadingService } from '../../../services/loading.service';
import { Attendance } from '../../../models/attendance.model';

@Component({
  selector: 'app-events-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events-view.component.html',
  styleUrls: ['./events-view.component.css']
})
export class EventsViewComponent implements OnInit {
  event: Event | null = null;
  loading = false;
  searchTerm = '';
  filteredAttendances: Attendance[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadEvent();
  }

  loadEvent() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.router.navigate(['/events']);
      return;
    }

    this.loadingService.show();
    this.eventService.getEvent(eventId).subscribe({
      next: (response: EventResponse) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            this.event = response.data[0];
            this.filteredAttendances = this.event.attendances || [];
          } else {
            this.router.navigate(['/events']);
          }
        } else {
          this.router.navigate(['/events']);
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loadingService.hide();
        this.router.navigate(['/events']);
      }
    });
  }

  filterAttendances() {
    if (!this.event?.attendances) return;
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredAttendances = this.event.attendances.filter(attendance => 
      attendance.affiliate.fullName.toLowerCase().includes(searchLower) ||
      attendance.affiliate.externalId.toLowerCase().includes(searchLower)
    );
  }

  onEdit(): void {
    if (this.event) {
      this.router.navigate(['/events/edit', this.event._id]);
    }
  }

  onReport(): void {
    if (this.event) {
      this.router.navigate(['/events', this.event._id, 'report']);
    }
  }

  onBack() {
    this.router.navigate(['/events']);
  }
} 