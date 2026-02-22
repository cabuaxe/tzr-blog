import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'dateDe', standalone: true, pure: false })
export class DateDePipe implements PipeTransform {
  private langService = inject(LanguageService);

  private monthNames: Record<string, string[]> = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };

  transform(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    const lang = this.langService.currentLang();
    const months = this.monthNames[lang] || this.monthNames['de'];

    if (lang === 'en') {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
