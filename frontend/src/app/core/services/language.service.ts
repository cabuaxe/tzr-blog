import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'de' | 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  currentLang = signal<AppLanguage>('de');

  readonly languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  init() {
    this.translate.addLangs(['de', 'pt', 'en']);
    this.translate.setDefaultLang('de');
    const saved = localStorage.getItem('tzr_lang') as AppLanguage | null;
    const lang = saved && ['de', 'pt', 'en'].includes(saved) ? saved : 'de';
    this.setLanguage(lang);
  }

  setLanguage(lang: AppLanguage) {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('tzr_lang', lang);
  }
}
