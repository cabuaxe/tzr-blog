import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { TranslateModule } from '@ngx-translate/core';
import { RouteHelperService } from '../../core/services/route-helper.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="container page-enter">
      <div class="page-header">
        <h1>{{ 'categories.title' | translate }}</h1>
        <p>{{ 'categories.desc' | translate }}</p>
      </div>

      <section class="cat-section">
        <h2>{{ 'categories.educational' | translate }}</h2>
        <div class="cat-grid">
          @for (cat of bildungsbereiche(); track cat.id) {
            <a [routerLink]="routeHelper.areaDetailUrl(cat.slug)" class="cat-card" [style.border-left-color]="cat.color">
              <span class="cat-emoji">{{ cat.emoji }}</span>
              <h3>{{ cat.displayName }}</h3>
              <p class="cat-desc">{{ cat.description }}</p>
              <span class="cat-count" [style.color]="cat.color">{{ 'categories.articleCount' | translate:{count: cat.articleCount} }}</span>
            </a>
          }
        </div>
      </section>

      <section class="cat-section">
        <h2>{{ 'categories.crossCutting' | translate }}</h2>
        <div class="cat-grid">
          @for (cat of querschnittsaufgaben(); track cat.id) {
            <a [routerLink]="routeHelper.areaDetailUrl(cat.slug)" class="cat-card" [style.border-left-color]="cat.color">
              <span class="cat-emoji">{{ cat.emoji }}</span>
              <h3>{{ cat.displayName }}</h3>
              <p class="cat-desc">{{ cat.description }}</p>
              <span class="cat-count" [style.color]="cat.color">{{ 'categories.articleCount' | translate:{count: cat.articleCount} }}</span>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { padding: 2.5rem 0 1rem; }
    .page-header h1 { font-family: 'Lora', serif; font-weight: 700; font-size: 1.8rem; color: var(--ink); }
    .page-header p { font-size: 0.88rem; color: var(--ink-light); margin-top: 0.4rem; }
    .cat-section { margin-bottom: 2.5rem; }
    .cat-section h2 {
      font-family: 'Lora', serif; font-weight: 700; font-size: 1.15rem;
      color: var(--ink); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);
    }
    .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .cat-card {
      padding: 1.3rem; border: 1px solid var(--border); border-left: 4px solid;
      border-radius: 8px; transition: box-shadow 0.2s, transform 0.15s; background: #fff;
    }
    .cat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); transform: translateY(-1px); }
    .cat-emoji { font-size: 1.8rem; display: block; margin-bottom: 0.5rem; }
    .cat-card h3 { font-family: 'Lora', serif; font-weight: 600; font-size: 1rem; color: var(--ink); }
    .cat-desc { font-size: 0.8rem; color: var(--ink-light); line-height: 1.5; margin: 0.4rem 0; }
    .cat-count { font-size: 0.72rem; font-weight: 700; }
    @media (max-width: 960px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .cat-grid { grid-template-columns: 1fr; } }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  routeHelper = inject(RouteHelperService);
  categories = signal<Category[]>([]);
  bildungsbereiche = signal<Category[]>([]);
  querschnittsaufgaben = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getAllCategories().subscribe(cats => {
      this.categories.set(cats);
      this.bildungsbereiche.set(cats.filter(c => c.type === 'BILDUNGSBEREICH'));
      this.querschnittsaufgaben.set(cats.filter(c => c.type === 'QUERSCHNITTSAUFGABE'));
    });
  }
}
