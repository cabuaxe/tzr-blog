import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { ArticleList } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [ArticleCardComponent, PaginationComponent, TranslateModule],
  template: `
    <div class="container page-enter">
      <div class="page-header">
        @if (tagSlug()) {
          <h1>{{ 'search.topic' | translate }}: {{ tagSlug() }}</h1>
        } @else {
          <h1>{{ 'search.results' | translate }}{{ query() ? ': \u201E' + query() + '\u201C' : '' }}</h1>
        }
        <p class="result-count">{{ 'search.resultCount' | translate:{count: totalElements()} }}</p>
      </div>

      <div class="article-grid">
        @for (article of articles(); track article.id) {
          <app-article-card [article]="article" />
        }
      </div>
      @if (!articles().length && !loading()) {
        <p class="empty">{{ 'search.noResults' | translate }}</p>
      }
      <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
    </div>
  `,
  styles: [`
    .page-header { padding: 2rem 0 1.5rem; }
    .page-header h1 { font-family: 'Lora', serif; font-weight: 700; font-size: 1.5rem; color: var(--ink); }
    .result-count { font-size: 0.82rem; color: var(--ink-light); margin-top: 0.3rem; }
    .empty { text-align: center; padding: 3rem; color: var(--ink-faint); font-size: 0.9rem; }
  `]
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private destroyRef = inject(DestroyRef);

  articles = signal<ArticleList[]>([]);
  query = signal('');
  tagSlug = signal<string | null>(null);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  loading = signal(false);

  ngOnInit() {
    // Handle both search and tag routes
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.tagSlug.set(slug);
        this.loadByTag(slug);
      }
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const q = params.get('q');
      if (q) {
        this.query.set(q);
        this.tagSlug.set(null);
        this.search(q);
      }
    });
  }

  search(q: string) {
    this.loading.set(true);
    this.articleService.searchArticles(q, this.page(), 12).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });
  }

  loadByTag(slug: string) {
    this.loading.set(true);
    this.articleService.getPublishedArticles({ tag: slug, page: this.page(), size: 12 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });
  }

  onPage(p: number) {
    this.page.set(p);
    if (this.tagSlug()) this.loadByTag(this.tagSlug()!);
    else if (this.query()) this.search(this.query());
  }
}
