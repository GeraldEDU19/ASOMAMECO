import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private languageService: LanguageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const language = this.languageService.getCurrentLanguage();
    
    const modifiedRequest = req.clone({
      setHeaders: {
        'Accept-Language': language === 'en' ? 'en' : 'es'
      }
    });

    console.log('Language Interceptor - Request:', {
      url: modifiedRequest.url,
      headers: modifiedRequest.headers.get('Accept-Language')
    });

    return next.handle(modifiedRequest);
  }
} 