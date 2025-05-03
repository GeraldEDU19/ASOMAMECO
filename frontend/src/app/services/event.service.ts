import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventResponse } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/search`);
  }

  getEvent(id: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Event): Observable<EventResponse> {
    return this.http.post<EventResponse>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Event): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<EventResponse> {
    return this.http.delete<EventResponse>(`${this.apiUrl}/${id}`);
  }
} 