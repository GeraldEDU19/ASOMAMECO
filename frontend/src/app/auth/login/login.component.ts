import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
  errorMessage = '';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const { email, password } = this.loginForm.value;
    if (email && password) {
      this.userService.login({ email, password }).subscribe({
        next: (resp) => {
          // Imprime todo lo que venga en la respuesta
          console.log('Login response:', resp);
  
          // Si viene un campo token, lo guardas y navegas
          if (resp.data.token) {
            localStorage.setItem('token', resp.data.token);
            this.router.navigate(['/dashboard']);
          }
        },
        error: err => {
          console.error('Login error:', err);
          this.errorMessage =
            err.error?.message || err.message || 'Error al iniciar sesión';
          this.showToast = true;
          setTimeout(() => (this.showToast = false), 3000);
        }
      });
    }
  }
  

  closeToast(): void {
    this.showToast = false;
  }
}
