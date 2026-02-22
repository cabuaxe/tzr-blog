import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'readingTime', standalone: true, pure: false })
export class ReadingTimePipe implements PipeTransform {
  private langService = inject(LanguageService);

  transform(minutes: number): string {
    const lang = this.langService.currentLang();
    const min = !minutes || minutes <= 1 ? 1 : minutes;
    switch (lang) {
      case 'pt': return `${min} min. de leitura`;
      case 'en': return `${min} min read`;
      default: return `${min} Min. Lesezeit`;
    }
  }
}
