import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject: BehaviorSubject<string>;
  private readonly defaultLanguage = 'en';
  private readonly supportedLanguages = ['en', 'es'];
  private readonly storageKey = 'app_language';
  private _translateService: TranslateService | null = null;

  constructor(private injector: Injector) { 
    // SOLO inicializar el BehaviorSubject aquí
    const storedLanguage = this.getStoredLanguage();
    this.currentLanguageSubject = new BehaviorSubject<string>(storedLanguage);
    // NO llamar a getTranslateService aquí
  }

  // Método para obtener TranslateService perezosamente (sin configuración inicial aquí)
  private getTranslateService(): TranslateService {
    if (!this._translateService) {
      this._translateService = this.injector.get(TranslateService);
      // La configuración inicial (setDefaultLang, use) se hará en APP_INITIALIZER
    }
    return this._translateService;
  }

  private getStoredLanguage(): string {
    const stored = localStorage.getItem(this.storageKey);
    return stored && this.supportedLanguages.includes(stored) ? stored : this.defaultLanguage;
  }

  setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      localStorage.setItem(this.storageKey, language);
      this.currentLanguageSubject.next(language);
      // Solo llamar a use() aquí para cambios posteriores
      this.getTranslateService().use(language); 
    } else {
      console.warn(`LanguageService: Language '${language}' is not supported.`);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.getValue();
  }

  getCurrentLanguageObservable() {
    return this.currentLanguageSubject.asObservable();
  }
} 