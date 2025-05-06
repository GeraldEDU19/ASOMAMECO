import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api/api.service';

// Definir la interfaz para la respuesta estándar de la API
export interface ApiResponse<T = any> { // T es un genérico para el tipo de data
  success: boolean;
  status: string; // O un enum si tienes uno definido en el frontend
  message: string;
  data: T;
  controlled: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  // Usar la interfaz ApiResponse con el tipo específico para data
  login(data: { email: string; password: string }): Observable<ApiResponse<{token: string}>> {
    return this.api.post('api/users/login', data);
  }
}
