import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ArticleService } from '../../core/services/article.service';
import { Category } from '../../core/models/category.model';
import { ArticleList } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouteHelperService } from '../../core/services/route-helper.service';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent, PaginationComponent, TranslateModule],
  template: `
    @if (category()) {
      <div class="container page-enter">
        <nav class="breadcrumbs">
          <a [routerLink]="routeHelper.home()">{{ 'nav.home' | translate }}</a><span class="sep">&rsaquo;</span>
          <a [routerLink]="routeHelper.areasUrl()">{{ 'nav.areas' | translate }}</a><span class="sep">&rsaquo;</span>
          <span>{{ category()!.displayName }}</span>
        </nav>
        <div class="cat-header" [style.border-left-color]="category()!.color">
          <span class="emoji">{{ category()!.emoji }}</span>
          <h1>{{ category()!.displayName }}</h1>
          <p>{{ category()!.description }}</p>
        </div>

        <div class="filter-bar">
          <button [class.active]="filter() === 'all'" (click)="setFilter('all')">{{ 'categories.all' | translate }}</button>
          <button [class.active]="filter() === 'praxis'" (click)="setFilter('praxis')">{{ 'categories.practice' | translate }}</button>
          <button [class.active]="filter() === 'academic'" (click)="setFilter('academic')">{{ 'article.academic' | translate }}</button>
        </div>

        <div class="article-grid">
          @for (article of articles(); track article.id) {
            <app-article-card [article]="article" />
          }
        </div>
        @if (!articles().length) {
          <p class="empty">{{ 'categories.noArticles' | translate }}</p>
        }
        <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
      </div>
    }
  `,
  styles: [`
    .breadcrumbs {
      font-size: 0.75rem; color: var(--ink-faint); padding: 1.5rem 0 0;
      display: flex; gap: 0.3rem;
    }
    .breadcrumbs a { color: var(--ink-light); }
    .breadcrumbs .sep { opacity: 0.4; }
    .cat-header {
      padding: 1.5rem 0 1.5rem 1.2rem; border-left: 4px solid; margin: 1rem 0 1.5rem;
    }
    .emoji { font-size: 2.2rem; }
    .cat-header h1 { font-family: 'Lora', serif; font-weight: 700; font-size: 1.6rem; color: var(--ink); margin: 0.3rem 0; }
    .cat-header p { font-size: 0.88rem; color: var(--ink-light); }
    .filter-bar { display: flex; gap: 0.4rem; margin-bottom: 1.5rem; }
    .filter-bar button {
      padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
      background: var(--surface-hover); color: var(--ink-light); border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .filter-bar button.active { background: var(--ink); color: #fff; border-color: var(--ink); }
    .empty { text-align: center; padding: 3rem; color: var(--ink-faint); }
  `]
})
export class CategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private articleService = inject(ArticleService);
  private destroyRef = inject(DestroyRef);
  routeHelper = inject(RouteHelperService);

  category = signal<Category | null>(null);
  articles = signal<ArticleList[]>([]);
  page = signal(0);
  totalPages = signal(0);
  filter = signal<'all' | 'praxis' | 'academic'>('all');

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.categoryService.getCategoryBySlug(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(c => this.category.set(c));
        this.loadArticles(slug);
      }
    });
  }

  loadArticles(slug?: string) {
    const catSlug = slug || this.category()?.slug;
    if (!catSlug) return;
    const params: any = { category: catSlug, page: this.page(), size: 12 };
    if (this.filter() === 'academic') params.academic = true;
    if (this.filter() === 'praxis') params.academic = false;
    this.articleService.getPublishedArticles(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
    });
  }

  setFilter(f: 'all' | 'praxis' | 'academic') {
    this.filter.set(f);
    this.page.set(0);
    this.loadArticles();
  }

  onPage(p: number) {
    this.page.set(p);
    this.loadArticles();
  }
}
