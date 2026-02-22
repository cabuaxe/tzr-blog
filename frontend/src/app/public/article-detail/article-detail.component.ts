import { Component, inject, OnInit, signal, computed, SecurityContext } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';
import { ArticleList } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { ReadingTimePipe } from '../../shared/pipes/reading-time.pipe';
import { DateDePipe } from '../../shared/pipes/date-de.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { RouteHelperService } from '../../core/services/route-helper.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent, ReadingTimePipe, DateDePipe, TranslateModule],
  template: `
    @if (article()) {
      <!-- Cover Image -->
      <div class="cover" [style.background-image]="'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.03) 55%), url(' + article()!.coverImageUrl + '?auto=compress&cs=tinysrgb&w=1400&h=500&fit=crop)'">
        @if (article()!.coverImageCredit) {
          <span class="credit">{{ 'article.photo' | translate }}: {{ article()!.coverImageCredit }}</span>
        }
      </div>

      <article class="container article-container page-enter">
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
          <a [routerLink]="routeHelper.home()">{{ 'nav.home' | translate }}</a>
          <span class="sep">&rsaquo;</span>
          <a [routerLink]="routeHelper.areasUrl()">{{ 'nav.areas' | translate }}</a>
          <span class="sep">&rsaquo;</span>
          <a [routerLink]="routeHelper.areaDetailUrl(article()!.category.slug)">{{ article()!.category.displayName }}</a>
          <span class="sep">&rsaquo;</span>
          <span class="current">{{ article()!.title }}</span>
        </nav>

        <!-- Header -->
        <header class="article-header">
          <div class="header-badges">
            <span class="cat-tag" [style.background]="article()!.category.bgColor" [style.color]="article()!.category.color">
              {{ article()!.category.emoji }} {{ article()!.category.displayName }}
            </span>
            @if (article()!.academic) {
              <span class="academic-tag">{{ 'article.academic' | translate }}</span>
            }
          </div>
          <h1>{{ article()!.title }}</h1>
          <div class="meta-row">
            <a [routerLink]="routeHelper.authorUrl(article()!.author.slug)" class="author-link">
              {{ article()!.author.name }}
            </a>
            <span class="dot">&middot;</span>
            <span>{{ article()!.publishedDate | dateDe }}</span>
            <span class="dot">&middot;</span>
            <span>{{ article()!.readingTimeMinutes | readingTime }}</span>
          </div>
          @if (article()!.tags.length) {
            <div class="tag-row">
              @for (tag of article()!.tags; track tag.id) {
                <a [routerLink]="routeHelper.topicUrl(tag.slug)" class="tag-pill">{{ tag.name }}</a>
              }
            </div>
          }
        </header>

        <!-- Body -->
        <div class="article-body" [innerHTML]="cleanBody()"></div>

        <!-- Related Articles -->
        @if (related().length) {
          <section class="related-section">
            <h2 class="related-title">{{ 'article.relatedArticles' | translate }}</h2>
            <div class="article-grid">
              @for (r of related(); track r.id) {
                <app-article-card [article]="r" />
              }
            </div>
          </section>
        }
      </article>
    }
  `,
  styles: [`
    .cover {
      height: 400px; background-size: cover; background-position: center;
      position: relative;
    }
    .credit {
      position: absolute; bottom: 12px; right: 18px;
      font-size: 0.7rem; color: rgba(255,255,255,0.75); background: rgba(0,0,0,0.35);
      padding: 0.18rem 0.6rem; border-radius: 5px; backdrop-filter: blur(4px);
    }
    .article-container { max-width: var(--max-w-article); padding-top: 1.8rem; padding-bottom: 3rem; }
    .breadcrumbs {
      font-size: 0.76rem; color: var(--ink-faint); margin-bottom: 1.8rem;
      display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center;
    }
    .breadcrumbs a { color: var(--ink-light); transition: color 0.15s; }
    .breadcrumbs a:hover { color: var(--ink); }
    .breadcrumbs .current { color: var(--ink); font-weight: 600; }
    .breadcrumbs .sep { opacity: 0.35; font-size: 0.7rem; }
    .article-header { margin-bottom: 2.5rem; }
    .header-badges { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
    .cat-tag {
      display: inline-block; padding: 0.22rem 0.7rem; border-radius: 5px;
      font-size: 0.74rem; font-weight: 700;
    }
    .academic-tag {
      display: inline-block; padding: 0.22rem 0.7rem; border-radius: 5px;
      font-size: 0.74rem; font-weight: 700;
      background: var(--surface-hover); color: var(--ink-light); border: 1px solid var(--border);
    }
    .article-header h1 {
      font-family: 'Lora', serif; font-weight: 700; font-size: 2.2rem;
      line-height: 1.28; color: var(--ink); margin-bottom: 1rem;
    }
    .meta-row {
      display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;
      font-size: 0.85rem; color: var(--ink-light);
    }
    .author-link { font-weight: 700; color: var(--ink); }
    .author-link:hover { text-decoration: underline; }
    .dot { opacity: 0.35; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; }
    .tag-pill {
      padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.74rem; font-weight: 600;
      background: var(--surface-hover); color: var(--ink-light); border: 1.5px solid var(--border);
      transition: all 0.2s;
    }
    .tag-pill:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
    .related-section {
      margin-top: 3.5rem; padding-top: 2.5rem; border-top: 2px solid var(--border);
    }
    .related-title {
      font-family: 'Lora', serif; font-weight: 700; font-size: 1.25rem;
      color: var(--ink); margin-bottom: 1.2rem;
    }
    @media (max-width: 640px) {
      .cover { height: 260px; }
      .article-header h1 { font-size: 1.6rem; }
      .article-container { padding-top: 1.2rem; }
    }
  `]
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);
  routeHelper = inject(RouteHelperService);

  article = signal<Article | null>(null);
  related = signal<ArticleList[]>([]);

  cleanBody = computed(() => {
    const body = this.article()?.body;
    if (!body) return '';
    const cleaned = body
      .replace(/<article>\s*/gi, '')
      .replace(/<\/article>\s*/gi, '')
      .replace(/<h1[^>]*>.*?<\/h1>\s*/gi, '');
    return this.sanitizer.sanitize(SecurityContext.HTML, cleaned) ?? '';
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.articleService.getArticleBySlug(slug).subscribe(a => {
          this.article.set(a);
          window.scrollTo({ top: 0 });
        });
        this.articleService.getRelatedArticles(slug).subscribe(res => this.related.set(res.content));
      }
    });
  }
}
