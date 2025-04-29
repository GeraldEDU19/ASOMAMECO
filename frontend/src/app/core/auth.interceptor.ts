import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/confirm-attendance/')) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');
    if (token) {
      const authReq = req.clone({
        setHeaders: { Authorization: token }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
