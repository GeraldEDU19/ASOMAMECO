import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api/api.service';

export interface ApiResponse<T> {
  success: boolean;
  status: string;
  message: string;
  data: T;
}

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

  search(query?: any): Observable<ApiResponse<Affiliate[]>> {
    return this.api.get<ApiResponse<Affiliate[]>>('api/affiliates/search', query);
  }

  getAll(): Observable<ApiResponse<Affiliate[]>> {
    return this.search();
  }

  getById(id: string): Observable<ApiResponse<Affiliate | null>> {
    return this.search({ _id: id }).pipe(
      map(response => {
        const affiliate = (response.success && Array.isArray(response.data) && response.data.length > 0)
                          ? response.data[0]
                          : null;
        return { ...response, data: affiliate };
      })
    );
  }

  create(a: Affiliate): Observable<ApiResponse<Affiliate>> {
    return this.api.post<ApiResponse<Affiliate>>('api/affiliates', a);
  }

  update(id: string, a: Affiliate): Observable<ApiResponse<Affiliate>> {
    return this.api.put<ApiResponse<Affiliate>>(`api/affiliates/${id}`, a);
  }
}
