import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouteHelperService } from '../../../core/services/route-helper.service';
import { ArticleList } from '../../../core/models/article.model';
import { ReadingTimePipe } from '../../pipes/reading-time.pipe';
import { DateDePipe } from '../../pipes/date-de.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink, ReadingTimePipe, DateDePipe, TruncatePipe, TranslateModule],
  template: `
    <a [routerLink]="routeHelper.articleUrl(article().slug)" class="card">
      <div class="card-header" [style.background-image]="'url(' + article().coverImageUrl + '?auto=compress&cs=tinysrgb&w=600&h=340&fit=crop)'">
        <span class="card-emoji">{{ article().cardEmoji }}</span>
        @if (article().academic) {
          <span class="academic-badge">{{ 'article.academic' | translate }}</span>
        }
      </div>
      <div class="card-body">
        <span class="category-pill" [style.background]="article().category.bgColor" [style.color]="article().category.color">
          {{ article().category.emoji }} {{ article().category.displayName }}
        </span>
        <h3 class="card-title">{{ article().title }}</h3>
        <p class="card-excerpt">{{ article().excerpt | truncate:120 }}</p>
        <div class="card-meta">
          <span class="author">{{ article().author.name }}</span>
          <span class="sep">&middot;</span>
          <span>{{ article().publishedDate | dateDe }}</span>
          <span class="sep">&middot;</span>
          <span>{{ article().readingTimeMinutes | readingTime }}</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: flex; height: 100%; }
    .card {
      display: flex; flex-direction: column; width: 100%;
      border: 1px solid var(--border); border-radius: 12px;
      overflow: hidden; transition: box-shadow 0.25s, transform 0.2s;
      background: #fff;
    }
    .card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-3px); }
    .card-header {
      height: 190px; background-size: cover; background-position: center;
      position: relative; flex-shrink: 0;
    }
    .card-emoji {
      position: absolute; bottom: -16px; left: 16px;
      font-size: 1.6rem; background: #fff; border-radius: 50%;
      width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .academic-badge {
      position: absolute; top: 10px; right: 10px;
      background: rgba(255,255,255,0.95); padding: 0.22rem 0.6rem;
      border-radius: 5px; font-size: 0.7rem; font-weight: 700;
      color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .card-body { padding: 1.4rem 1.1rem 1.1rem; flex: 1; display: flex; flex-direction: column; }
    .category-pill {
      display: inline-block; padding: 0.18rem 0.55rem; border-radius: 5px;
      font-size: 0.72rem; font-weight: 700; margin-bottom: 0.5rem; width: fit-content;
    }
    .card-title {
      font-family: 'Lora', serif; font-weight: 600; font-size: 1.02rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.5rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-excerpt {
      font-size: 0.84rem; color: var(--ink-light); line-height: 1.55; flex: 1;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-meta {
      display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
      font-size: 0.76rem; color: var(--ink-faint); margin-top: auto;
      padding-top: 0.8rem; border-top: 1px solid var(--border-light);
    }
    .author { font-weight: 600; color: var(--ink-light); }
    .sep { opacity: 0.4; }
  `]
})
export class ArticleCardComponent {
  routeHelper = inject(RouteHelperService);
  article = input.required<ArticleList>();
}
