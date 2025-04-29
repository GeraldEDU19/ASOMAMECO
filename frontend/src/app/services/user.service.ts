import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  login(data: { email: string; password: string }): Observable<{ data: {token: string} }> {
    return this.api.post('api/users/login', data);
  }
}
