import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { RouteHelperService } from '../../../core/services/route-helper.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <nav class="navbar">
      <div class="navbar-inner container">
        <a [routerLink]="routeHelper.home()" class="navbar-brand">
          <span class="brand-logo">TZR</span>
          <span class="brand-sub">{{ 'brand.tagline' | translate }}</span>
        </a>
        <div class="navbar-links">
          <a [routerLink]="routeHelper.home()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ 'nav.home' | translate }}</a>
          <a [routerLink]="routeHelper.areasUrl()" routerLinkActive="active">{{ 'nav.areas' | translate }}</a>
          <app-language-switcher />
          <button class="search-btn" (click)="toggleSearch()" [attr.aria-label]="'nav.search' | translate">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
        <button class="hamburger-btn" (click)="toggleMobileMenu()" [attr.aria-label]="'nav.menu' | translate">
          {{ mobileMenuOpen() ? '✕' : '☰' }}
        </button>
      </div>
      @if (mobileMenuOpen()) {
        <div class="mobile-menu">
          <a [routerLink]="routeHelper.home()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">{{ 'nav.home' | translate }}</a>
          <a [routerLink]="routeHelper.areasUrl()" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.areas' | translate }}</a>
          <button class="mobile-search-btn" (click)="toggleSearch(); closeMobileMenu()">{{ 'nav.search' | translate }}</button>
        </div>
      }
      @if (searchOpen()) {
        <div class="search-overlay">
          <div class="container">
            <form (ngSubmit)="onSearch()" class="search-form">
              <input type="text" [(ngModel)]="searchQuery" name="q" [placeholder]="'nav.searchPlaceholder' | translate" autofocus />
              <button type="submit">{{ 'nav.searchBtn' | translate }}</button>
              <button type="button" class="close-btn" (click)="toggleSearch()">✕</button>
            </form>
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: #fff; border-bottom: 1px solid var(--border);
      height: 52px;
    }
    .navbar-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 52px;
    }
    .navbar-brand { display: flex; align-items: baseline; gap: 0.6rem; }
    .brand-logo {
      font-family: 'Lora', serif; font-weight: 800; font-size: 1.3rem;
      color: var(--ink); letter-spacing: -0.5px;
    }
    .brand-sub { font-size: 0.75rem; color: var(--ink-light); }
    .navbar-links { display: flex; align-items: center; gap: 1.5rem; }
    .navbar-links a {
      font-size: 0.82rem; font-weight: 600; color: var(--ink-light);
      transition: color 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.active { color: var(--ink); }
    .search-btn {
      background: none; padding: 0.3rem; color: var(--ink-light);
      transition: color 0.2s;
    }
    .search-btn:hover { color: var(--ink); }
    .hamburger-btn {
      display: none; font-size: 1.3rem; background: none; border: none;
      color: var(--ink-light); cursor: pointer; padding: 0.3rem;
    }
    .mobile-menu { display: none; }
    .search-overlay {
      position: absolute; top: 52px; left: 0; right: 0;
      background: #fff; border-bottom: 1px solid var(--border);
      padding: 0.8rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .search-form { display: flex; gap: 0.5rem; }
    .search-form input {
      flex: 1; padding: 0.5rem 0.8rem; border: 1px solid var(--border);
      border-radius: 6px; font-family: inherit; font-size: 0.85rem; outline: none;
    }
    .search-form input:focus { border-color: var(--ink-faint); }
    .search-form button[type="submit"] {
      padding: 0.5rem 1rem; background: var(--ink); color: #fff;
      border-radius: 6px; font-size: 0.82rem; font-weight: 600;
    }
    .close-btn { background: none; font-size: 1rem; color: var(--ink-light); padding: 0.5rem; }
    @media (max-width: 640px) {
      .brand-sub { display: none; }
      .navbar-links { display: none; }
      .hamburger-btn { display: block; }
      .mobile-menu {
        display: block; position: absolute; top: 52px; left: 0; right: 0;
        background: #fff; border-bottom: 1px solid var(--border);
        padding: 0.8rem 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      }
      .mobile-menu a, .mobile-search-btn {
        display: block; padding: 0.6rem 0; font-size: 0.9rem; font-weight: 600;
        color: var(--ink-light); text-decoration: none; transition: color 0.2s;
        background: none; border: none; font-family: inherit; cursor: pointer; text-align: left;
      }
      .mobile-menu a:hover, .mobile-menu a.active, .mobile-search-btn:hover { color: var(--ink); }
    }
  `]
})
export class NavbarComponent {
  searchOpen = signal(false);
  mobileMenuOpen = signal(false);
  searchQuery = '';
  private router = inject(Router);
  routeHelper = inject(RouteHelperService);

  toggleSearch() {
    this.searchOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(this.routeHelper.searchUrl(), { queryParams: { q: this.searchQuery.trim() } });
      this.searchOpen.set(false);
      this.searchQuery = '';
    }
  }
}
