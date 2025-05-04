import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { Event, EventResponse } from '../../../models/event.model';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  filtered: Event[] = [];
  search: string = '';
  loading: boolean = true;
  error: string | null = null;
  private loadingSub?: Subscription;

  constructor(
    private eventService: EventService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadingSub = this.loadingService.loading$.subscribe(val => this.loading = val);
    this.loadEvents();
  }

  ngOnDestroy() {
    this.loadingSub?.unsubscribe();
  }

  loadEvents() {
    this.loadingService.show();
    this.eventService.getEvents().subscribe({
      next: (response: EventResponse) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          this.events = response.data;
          this.filtered = response.data;
        } else {
          this.error = 'No se pudieron cargar los eventos';
        }
        this.loadingService.hide();
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.error = 'Error al cargar los eventos';
        this.loadingService.hide();
      }
    });
  }

  filter() {
    if (!this.search) {
      this.filtered = this.events;
      return;
    }

    const searchLower = this.search.toLowerCase();
    this.filtered = this.events.filter(event => 
      event.name.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower)
    );
  }

  onCreate() {
    this.router.navigate(['/events/create']);
  }

  onEdit(event: Event) {
    this.router.navigate(['/events/edit', event._id]);
  }

  onView(event: Event) {
    this.router.navigate(['/events/view', event._id]);
  }

  onDelete(event: Event) {
    if (event._id && confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.loadingService.show();
      this.eventService.deleteEvent(event._id).subscribe({
        next: (response: EventResponse) => {
          if (response.success) {
            this.loadEvents();
          }
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.loadingService.hide();
        }
      });
    }
  }
} 