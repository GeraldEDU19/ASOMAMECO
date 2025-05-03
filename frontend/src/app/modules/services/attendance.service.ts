// src/app/services/attendance.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}

  validateAttendance(token: string): Observable<any> {
    return this.api.get(`api/attendances/validate-attendance/${token}`);
  }

  checkAttendance(token: string): Observable<any> {
    return this.api.get(`api/attendances/check-attendance/${token}`);
  }
}
