// src/app/shared/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterLinkActive,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  currentLanguage: string = 'en';

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.languageService.getCurrentLanguageObservable().subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onLanguageChange(language: string): void {
    this.languageService.setLanguage(language);
    this.closeMenu();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.closeMenu();
    this.router.navigate(['/login']);
    alert(this.translate.instant('header.logout'));
  }
}
