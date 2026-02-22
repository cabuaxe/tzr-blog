import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { CategoryService } from '../../core/services/category.service';
import { NewsletterService } from '../../core/services/newsletter.service';
import { ArticleList } from '../../core/models/article.model';
import { Category } from '../../core/models/category.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { CategoryPillsComponent } from '../../shared/components/category-pills/category-pills.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ReadingTimePipe } from '../../shared/pipes/reading-time.pipe';
import { DateDePipe } from '../../shared/pipes/date-de.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent, CategoryPillsComponent, PaginationComponent, ReadingTimePipe, DateDePipe, FormsModule],
  template: `
    <!-- Hero Section (full-screen) -->
    @if (featured()) {
      <section class="hero"
               [style.background-image]="'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.1) 70%), url(' + featured()!.coverImageUrl + '?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)'">
        <div class="hero-inner container">
          <div class="hero-content">
            <span class="hero-cat" [style.background]="featured()!.category.bgColor" [style.color]="featured()!.category.color">
              {{ featured()!.category.emoji }} {{ featured()!.category.displayName }}
            </span>
            <h1 class="hero-title">{{ featured()!.title }}</h1>
            <p class="hero-excerpt">{{ featured()!.excerpt }}</p>
            <div class="hero-meta">
              <span>{{ featured()!.author.name }}</span>
              <span class="sep">&middot;</span>
              <span>{{ featured()!.publishedDate | dateDe }}</span>
              <span class="sep">&middot;</span>
              <span>{{ featured()!.readingTimeMinutes | readingTime }}</span>
            </div>
            <a [routerLink]="['/artikel', featured()!.slug]" class="hero-cta">Artikel lesen</a>
          </div>
          <div class="hero-side">
            @for (article of sideArticles(); track article.id) {
              <a [routerLink]="['/artikel', article.slug]" class="side-card">
                <img [src]="article.coverImageUrl + '?auto=compress&cs=tinysrgb&w=120&h=80&fit=crop'" [alt]="article.title" class="side-thumb" />
                <div class="side-content">
                  <span class="side-cat" [style.background]="article.category.bgColor" [style.color]="article.category.color">
                    {{ article.category.emoji }} {{ article.category.displayName }}
                  </span>
                  <h3>{{ article.title }}</h3>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- Category Pills + Articles Grid -->
    <section class="container">
      <div class="section-header">
        <h2 class="section-title">Praxisimpulse</h2>
      </div>

      @if (categories().length) {
        <app-category-pills [categories]="categories()" (categorySelected)="onCategoryFilter($event)" />
      }

      <div class="article-grid">
        @for (article of articles(); track article.id) {
          <app-article-card [article]="article" />
        }
      </div>

      <app-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" (pageChange)="onPageChange($event)" />
    </section>

    <!-- Newsletter -->
    <section class="newsletter-section">
      <div class="container">
        <div class="newsletter-box">
          <span class="newsletter-icon">&#9993;</span>
          <h2 class="newsletter-title">Bildungsimpulse per E-Mail</h2>
          <p class="newsletter-desc">Erhalten Sie monatlich neue Praxisideen und Fachartikel direkt in Ihr Postfach — kostenlos und jederzeit abbestellbar.</p>
          <form class="newsletter-form" (ngSubmit)="onSubscribe()">
            <input type="email" [(ngModel)]="newsletterEmail" name="email" placeholder="Ihre E-Mail-Adresse" required />
            <button type="submit">Abonnieren</button>
          </form>
          @if (subscribeMsg()) {
            <p class="subscribe-msg" [style.color]="subscribeMsgError() ? '#c24a8a' : '#3a9e7e'">{{ subscribeMsg() }}</p>
          }
        </div>
      </div>
    </section>

    <!-- Fachartikel -->
    <section class="container">
      <div class="section-header">
        <h2 class="section-title">Fachartikel</h2>
        <a routerLink="/suche" [queryParams]="{academic: true}" class="section-link">Alle Fachartikel &rarr;</a>
      </div>
      <div class="article-grid">
        @for (article of academicArticles(); track article.id) {
          <app-article-card [article]="article" />
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero {
      min-height: calc(100vh - 52px);
      background-size: cover; background-position: center;
      display: flex; align-items: flex-end;
    }
    .hero-inner {
      display: flex; align-items: flex-end; justify-content: space-between;
      gap: 2.5rem; padding-bottom: 3rem; width: 100%;
    }
    .hero-content { color: #fff; max-width: 620px; flex: 1; }
    .hero-cat {
      padding: 0.3rem 0.8rem; border-radius: 5px; font-size: 0.76rem; font-weight: 700;
      display: inline-block;
    }
    .hero-title {
      font-family: 'Lora', serif; font-weight: 700;
      font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.2; margin: 0.8rem 0 0.6rem;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .hero-excerpt {
      font-size: 1rem; line-height: 1.6; opacity: 0.92; max-width: 540px;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .hero-meta { font-size: 0.8rem; opacity: 0.85; margin-top: 0.8rem; display: flex; gap: 0.4rem; }
    .sep { opacity: 0.5; }
    .hero-cta {
      display: inline-block; margin-top: 1.2rem;
      padding: 0.6rem 1.6rem; background: #fff; color: var(--ink);
      border-radius: 8px; font-size: 0.85rem; font-weight: 700;
      transition: all 0.2s;
    }
    .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .hero-side {
      display: flex; flex-direction: column; gap: 0.8rem;
      min-width: 300px; max-width: 340px;
    }
    .side-card {
      display: flex; align-items: center; gap: 0.8rem;
      background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px; padding: 0.7rem; transition: all 0.2s;
    }
    .side-card:hover { background: rgba(255,255,255,0.2); transform: translateX(4px); }
    .side-thumb {
      width: 72px; height: 52px; border-radius: 6px; object-fit: cover; flex-shrink: 0;
    }
    .side-content { color: #fff; }
    .side-cat {
      padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700;
      display: inline-block;
    }
    .side-content h3 {
      font-family: 'Lora', serif; font-size: 0.85rem; font-weight: 600; line-height: 1.3;
      margin-top: 0.25rem; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .subscribe-msg { font-size: 0.85rem; margin-top: 1rem; }
    @media (max-width: 960px) {
      .hero-inner { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .hero-side { flex-direction: row; min-width: auto; max-width: 100%; width: 100%; }
      .side-card { flex: 1; }
    }
    @media (max-width: 640px) {
      .hero { min-height: calc(100vh - 52px); }
      .hero-side { flex-direction: column; }
      .hero-inner { padding-bottom: 2rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private newsletterService = inject(NewsletterService);
  private route = inject(ActivatedRoute);

  featured = signal<ArticleList | null>(null);
  sideArticles = signal<ArticleList[]>([]);
  articles = signal<ArticleList[]>([]);
  academicArticles = signal<ArticleList[]>([]);
  categories = signal<Category[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  selectedCategory = signal<string | null>(null);
  newsletterEmail = '';
  subscribeMsg = signal('');
  subscribeMsgError = signal(false);

  ngOnInit() {
    this.loadFeatured();
    this.loadCategories();
    this.loadArticles();
    this.loadAcademicArticles();
    this.checkSubscriptionStatus();
  }

  private checkSubscriptionStatus() {
    const subscribed = this.route.snapshot.queryParamMap.get('subscribed');
    if (subscribed === 'true') {
      this.subscribeMsg.set('Ihre Anmeldung wurde erfolgreich bestätigt! Willkommen!');
      this.subscribeMsgError.set(false);
    } else if (subscribed === 'error') {
      this.subscribeMsg.set('Der Bestätigungslink ist ungültig oder abgelaufen.');
      this.subscribeMsgError.set(true);
    }
  }

  loadFeatured() {
    this.articleService.getPublishedArticles({ size: 3, sort: 'publishedDate,desc' }).subscribe(res => {
      const all = res.content;
      this.featured.set(all[0] || null);
      this.sideArticles.set(all.slice(1, 3));
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(cats => this.categories.set(cats));
  }

  loadArticles() {
    const params: any = { page: this.currentPage(), size: 9 };
    if (this.selectedCategory()) params.category = this.selectedCategory();
    this.articleService.getPublishedArticles(params).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
    });
  }

  loadAcademicArticles() {
    this.articleService.getPublishedArticles({ academic: true, size: 3 }).subscribe(res => {
      this.academicArticles.set(res.content);
    });
  }

  onCategoryFilter(slug: string | null) {
    this.selectedCategory.set(slug);
    this.currentPage.set(0);
    this.loadArticles();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadArticles();
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  onSubscribe() {
    if (!this.newsletterEmail) return;
    this.newsletterService.subscribe(this.newsletterEmail).subscribe({
      next: (res: any) => {
        this.subscribeMsg.set(res.message || 'Bitte überprüfen Sie Ihr Postfach und bestätigen Sie Ihre Anmeldung.');
        this.subscribeMsgError.set(false);
        this.newsletterEmail = '';
      },
      error: () => {
        this.subscribeMsg.set('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        this.subscribeMsgError.set(true);
      }
    });
  }
}
