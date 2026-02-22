import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AuthorService } from '../../core/services/author.service';
import { Author } from '../../core/models/author.model';
import { ArticleList } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouteHelperService } from '../../core/services/route-helper.service';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent, PaginationComponent, TranslateModule],
  template: `
    @if (author()) {
      <div class="container page-enter">
        <nav class="breadcrumbs">
          <a [routerLink]="routeHelper.home()">{{ 'nav.home' | translate }}</a><span class="sep">&rsaquo;</span>
          <span>{{ author()!.name }}</span>
        </nav>
        <div class="author-header">
          @if (author()!.avatarUrl) {
            <img [src]="author()!.avatarUrl" [alt]="author()!.name" class="avatar" />
          } @else {
            <div class="avatar-placeholder">{{ author()!.name.charAt(0) }}</div>
          }
          <div>
            <h1>{{ author()!.name }}</h1>
            <p class="bio">{{ author()!.bio }}</p>
          </div>
        </div>

        <h2 class="section-title">{{ 'author.articlesBy' | translate:{name: author()!.name} }}</h2>
        <div class="article-grid">
          @for (article of articles(); track article.id) {
            <app-article-card [article]="article" />
          }
        </div>
        @if (!articles().length) {
          <p class="empty">{{ 'author.noArticles' | translate }}</p>
        }
        <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
      </div>
    }
  `,
  styles: [`
    .breadcrumbs { font-size: 0.75rem; color: var(--ink-faint); padding: 1.5rem 0 0; display: flex; gap: 0.3rem; }
    .breadcrumbs a { color: var(--ink-light); }
    .breadcrumbs .sep { opacity: 0.4; }
    .author-header { display: flex; gap: 1.5rem; align-items: flex-start; padding: 1.5rem 0 2rem; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder {
      width: 80px; height: 80px; border-radius: 50%; background: var(--surface-hover);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Lora', serif; font-size: 2rem; font-weight: 700; color: var(--ink-light);
    }
    .author-header h1 { font-family: 'Lora', serif; font-weight: 700; font-size: 1.5rem; color: var(--ink); }
    .bio { font-size: 0.88rem; color: var(--ink-light); line-height: 1.6; margin-top: 0.4rem; }
    .section-title { font-family: 'Lora', serif; font-weight: 700; font-size: 1.15rem; color: var(--ink); margin-bottom: 1rem; }
    .empty { text-align: center; padding: 3rem; color: var(--ink-faint); }
  `]
})
export class AuthorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authorService = inject(AuthorService);
  private articleService = inject(ArticleService);
  routeHelper = inject(RouteHelperService);

  author = signal<Author | null>(null);
  articles = signal<ArticleList[]>([]);
  page = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.authorService.getAuthorBySlug(slug).subscribe(a => this.author.set(a));
        this.loadArticles(slug);
      }
    });
  }

  loadArticles(slug?: string) {
    const s = slug || this.author()?.slug;
    if (!s) return;
    this.articleService.getPublishedArticles({ page: this.page(), size: 12, author: s }).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
    });
  }

  onPage(p: number) {
    this.page.set(p);
    this.loadArticles();
  }
}
