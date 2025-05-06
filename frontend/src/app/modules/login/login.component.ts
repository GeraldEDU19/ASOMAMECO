import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, ApiResponse } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
  errorMessage = '';
  showToast = false;
  currentLanguage: string;
  loading: boolean = false;
  passwordFieldType: string = 'password';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {}

  onLanguageChange(language: string): void {
    this.languageService.setLanguage(language);
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.showToast = false;

    const { email, password } = this.loginForm.value;
    
    if (email && password) {
      this.userService.login({ email, password }).subscribe({
        next: (resp: ApiResponse<{token: string}>) => {
          this.loading = false;
          console.log('Login response:', resp);

          if (resp.success && resp.data?.token) {
            localStorage.setItem('token', resp.data.token);
            this.router.navigate(['/dashboard']);
          } else if (!resp.success && resp.message) {
            this.handleError(resp.message);
          } else {
            this.handleError(this.translate.instant('login.unexpectedResponse'));
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          console.error('Login error:', err);

          if (err.status >= 500) {
            this.handleError(this.translate.instant('login.connectionError'));
          } else {
            const backendMessage = err.error?.message;
            this.handleError(
              backendMessage ? backendMessage : this.translate.instant('login.checkCredentials')
            );
          }
        }
      });
    }
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  closeToast(): void {
    this.showToast = false;
  }
}
