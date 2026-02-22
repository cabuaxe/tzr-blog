import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="list-page">
      <div class="page-header">
        <h1>{{ 'admin.categoryList.title' | translate }}</h1>
        <a routerLink="/admin/kategorien/neu" class="btn-primary">+ {{ 'admin.categoryList.newCategory' | translate }}</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ 'admin.categoryList.emoji' | translate }}</th>
              <th>{{ 'admin.categoryList.name' | translate }}</th>
              <th>{{ 'admin.categoryList.type' | translate }}</th>
              <th>{{ 'admin.categoryList.articleCount' | translate }}</th>
              <th>{{ 'admin.categoryList.sortOrder' | translate }}</th>
              <th>{{ 'admin.categoryList.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (cat of categories(); track cat.id) {
              <tr>
                <td>{{ cat.emoji }}</td>
                <td><span [style.color]="cat.color" class="cat-name">{{ cat.displayName }}</span></td>
                <td><span class="type-badge" [class]="cat.type.toLowerCase()">{{ cat.type === 'BILDUNGSBEREICH' ? ('admin.categoryList.educational' | translate) : ('admin.categoryList.crossCutting' | translate) }}</span></td>
                <td>{{ cat.articleCount }}</td>
                <td>{{ cat.sortOrder }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/kategorien', cat.id, 'bearbeiten']" class="action-btn">{{ 'admin.categoryList.edit' | translate }}</a>
                  <button class="action-btn danger" (click)="deleteCategory(cat)">{{ 'admin.categoryList.delete' | translate }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .list-page h1 { font-family: 'Lora', serif; font-size: 1.4rem; font-weight: 700; color: #1e1e2e; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1e1e2e; color: #fff; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e8e6e1; }
    th { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #787774; padding: 0.7rem 0.8rem; text-align: left; border-bottom: 1px solid #e8e6e1; background: #fafaf8; }
    td { padding: 0.6rem 0.8rem; font-size: 0.82rem; border-bottom: 1px solid #f1f0ec; }
    tr:hover td { background: #fafaf8; }
    .cat-name { font-weight: 600; }
    .type-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .type-badge.bildungsbereich { background: #e5f5ef; color: #3a9e7e; }
    .type-badge.querschnittsaufgabe { background: #eeebfb; color: #7b61d4; }
    .actions { display: flex; gap: 0.4rem; }
    .action-btn {
      padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600;
      background: #f7f6f3; color: #787774; border: 1px solid #e8e6e1; cursor: pointer;
    }
    .action-btn:hover { background: #e8e6e1; color: #37352f; }
    .action-btn.danger:hover { background: #fce6f1; color: #c24a8a; border-color: #c24a8a; }
  `]
})
export class AdminCategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private translate = inject(TranslateService);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAdminCategories().subscribe(c => this.categories.set(c));
  }

  deleteCategory(cat: Category) {
    if (cat.articleCount > 0) {
      alert(this.translate.instant('admin.categoryList.cannotDelete', { name: cat.displayName, count: cat.articleCount }));
      return;
    }
    if (confirm(this.translate.instant('admin.categoryList.confirmDelete', { name: cat.displayName }))) {
      this.categoryService.deleteCategory(cat.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.message || this.translate.instant('admin.categoryList.deleteError'))
      });
    }
  }
}
