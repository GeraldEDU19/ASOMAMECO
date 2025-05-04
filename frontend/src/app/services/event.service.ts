import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event, EventResponse } from '../models/event.model';

export interface EventReportData {
  totalAttendances: number;
  confirmed: number;
  notConfirmed: number;
  attended: number;
  confirmedButDidNotAttend: number;
}

export interface EventReportResponse {
  success: boolean;
  status: string;
  message: string;
  data: EventReportData;
  controlled: boolean;
}

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
    return this.http.get<EventResponse>(`${this.apiUrl}/search?_id=${id}`);
  }

  getEventReport(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/report`, {
      params: { _id: id }
    });
  }

  createEvent(event: Event): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  updateEvent(id: string, event: Event): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/search`, {
      params: { query }
    });
  }
} 