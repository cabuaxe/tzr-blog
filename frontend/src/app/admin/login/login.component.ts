import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1 class="brand">TZR</h1>
        <p class="subtitle">{{ 'admin.adminArea' | translate }}</p>
        <form (ngSubmit)="onLogin()">
          <div class="field">
            <label for="username">{{ 'admin.username' | translate }}</label>
            <input id="username" type="text" [(ngModel)]="username" name="username" required autofocus />
          </div>
          <div class="field">
            <label for="password">{{ 'admin.password' | translate }}</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" required />
          </div>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button type="submit" class="login-btn" [disabled]="loading()">
            {{ loading() ? ('admin.loggingIn' | translate) : ('admin.login' | translate) }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #f7f6f3;
    }
    .login-card {
      background: #fff; border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 380px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06); text-align: center;
    }
    .brand { font-family: 'Lora', serif; font-weight: 800; font-size: 1.8rem; color: #1e1e2e; }
    .subtitle { font-size: 0.82rem; color: #787774; margin-bottom: 2rem; }
    .field { text-align: left; margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.78rem; font-weight: 600; color: #37352f; margin-bottom: 0.3rem; }
    .field input {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e8e6e1; border-radius: 6px;
      font-family: inherit; font-size: 0.85rem; outline: none; transition: border-color 0.2s;
    }
    .field input:focus { border-color: #787774; }
    .error { color: #c24a8a; font-size: 0.8rem; margin-bottom: 0.8rem; }
    .login-btn {
      width: 100%; padding: 0.7rem; background: #1e1e2e; color: #fff; border-radius: 6px;
      font-size: 0.85rem; font-weight: 700; transition: opacity 0.2s;
    }
    .login-btn:hover:not(:disabled) { opacity: 0.9; }
    .login-btn:disabled { opacity: 0.6; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  username = '';
  password = '';
  error = signal('');
  loading = signal(false);

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.error.set(this.translate.instant('admin.loginError'));
        this.loading.set(false);
      }
    });
  }
}
