import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(private api: ApiService) {}

  validate(): Observable<boolean> {
    return this.api.get<{ success: boolean }>('api/users/validate-token')
      .pipe(
        map(res => res.success),
        catchError(() => of(false))
      );
  }
}
