// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';

export interface Affiliate {
  _id?: string;
  externalId: string;
  firstName: string;
  secondName?: string | null;
  firstLastName: string;
  secondLastName: string;
  email?: string | null;
  telephoneNumber: string;
  active: boolean;
  fullName?: string;
}

export interface Attendee {
  _id?: string;
  affiliate: Affiliate;
  confirmed: boolean;
  attended: boolean;
}

export interface Event {
  _id?: string;
  name: string;
  date: string; // ISO string con fecha y hora
  description?: string;
  location?: string;
  active?: boolean;
  attendees: Attendee[];
}

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: ApiService) {}
  getAll(): Observable<{ success: boolean; status: string; data: Event[] }> {
    return this.api.get('api/events/search');
  }
  create(e: Event & { update: boolean }): Observable<any> {
    return this.api.post('api/events', e);
  }
  update(id: string, e: Event & { update: boolean }): Observable<any> {
    return this.api.put(`api/events/${id}`, e);
  }
}
