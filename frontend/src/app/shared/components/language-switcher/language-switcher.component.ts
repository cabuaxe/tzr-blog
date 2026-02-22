import { Component, inject, signal } from '@angular/core';
import { LanguageService, AppLanguage } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="lang-switcher" (click)="toggle()">
      <span class="current-lang">{{ currentFlag() }} {{ currentLang().toUpperCase() }}</span>
      @if (open()) {
        <div class="lang-dropdown">
          @for (lang of langService.languages; track lang.code) {
            <button [class.active]="lang.code === currentLang()" (click)="selectLang(lang.code); $event.stopPropagation()">
              {{ lang.flag }} {{ lang.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lang-switcher {
      position: relative; cursor: pointer; user-select: none;
      padding: 0.3rem 0.6rem; border-radius: 6px;
      font-size: 0.78rem; font-weight: 600; color: var(--ink-light, #787774);
      transition: background 0.15s;
    }
    .lang-switcher:hover { background: var(--surface-hover, #f0efed); }
    .current-lang { display: flex; align-items: center; gap: 0.3rem; }
    .lang-dropdown {
      position: absolute; top: 100%; right: 0; margin-top: 4px;
      background: #fff; border: 1px solid #e8e6e1; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; z-index: 200;
      min-width: 140px;
    }
    .lang-dropdown button {
      display: block; width: 100%; text-align: left;
      padding: 0.5rem 0.8rem; font-size: 0.8rem; font-weight: 500;
      background: none; border: none; cursor: pointer; font-family: inherit;
      color: #37352f; transition: background 0.1s;
    }
    .lang-dropdown button:hover { background: #f7f6f3; }
    .lang-dropdown button.active { font-weight: 700; background: #f0efed; }
  `],
  host: { '(document:click)': 'close()' }
})
export class LanguageSwitcherComponent {
  langService = inject(LanguageService);
  open = signal(false);

  currentLang = this.langService.currentLang;
  currentFlag = () => this.langService.languages.find(l => l.code === this.currentLang())?.flag || '';

  toggle() { this.open.update(v => !v); }
  close() { this.open.set(false); }

  selectLang(code: AppLanguage) {
    this.langService.setLanguage(code);
    this.open.set(false);
  }
}
