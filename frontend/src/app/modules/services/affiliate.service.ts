import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';

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

@Injectable({ providedIn: 'root' })
export class AffiliateService {
  constructor(private api: ApiService) {}

  getAll(): Observable<{ success: boolean; status: string; data: Affiliate[] }> {
    return this.api.get('api/affiliates/search');
  }

  create(a: Affiliate): Observable<any> {
    return this.api.post('api/affiliates', a);
  }

  update(id: string, a: Affiliate): Observable<any> {
    return this.api.put(`api/affiliates/${id}`, a);
  }
}
