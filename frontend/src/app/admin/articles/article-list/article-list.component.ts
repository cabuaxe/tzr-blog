import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArticleService } from '../../../core/services/article.service';
import { CategoryService } from '../../../core/services/category.service';
import { ArticleList } from '../../../core/models/article.model';
import { Category } from '../../../core/models/category.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { DateDePipe } from '../../../shared/pipes/date-de.pipe';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent, DateDePipe, TranslateModule],
  template: `
    <div class="list-page">
      <div class="page-header">
        <h1>{{ 'admin.articleList.title' | translate }}</h1>
        <a routerLink="/admin/beitraege/neu" class="btn-primary">+ {{ 'admin.articleList.newArticle' | translate }}</a>
      </div>

      <div class="toolbar">
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" [placeholder]="'admin.articleList.search' | translate" class="search-input" />
        <select [(ngModel)]="filterStatus" (ngModelChange)="loadArticles()">
          <option value="">{{ 'admin.articleList.allStatuses' | translate }}</option>
          <option value="DRAFT">{{ 'admin.articleList.draft' | translate }}</option>
          <option value="PUBLISHED">{{ 'admin.articleList.published' | translate }}</option>
          <option value="ARCHIVED">{{ 'admin.articleList.archived' | translate }}</option>
        </select>
        <select [(ngModel)]="filterCategory" (ngModelChange)="loadArticles()">
          <option value="">{{ 'admin.articleList.allCategories' | translate }}</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.slug">{{ cat.displayName }}</option>
          }
        </select>
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="filterAcademic" (ngModelChange)="loadArticles()" />
          {{ 'admin.articleList.academicOnly' | translate }}
        </label>
      </div>

      @if (selectedIds.size > 0) {
        <div class="bulk-bar">
          <span class="bulk-count">{{ (selectedIds.size === 1 ? 'admin.articleList.selectedOne' : 'admin.articleList.selectedMany') | translate:{count: selectedIds.size} }}</span>
          <div class="bulk-actions">
            <select class="bulk-select" (change)="bulkChangeStatus($event)">
              <option value="" disabled selected>{{ 'admin.articleList.bulkStatus' | translate }}</option>
              <option value="DRAFT">{{ 'admin.articleList.draft' | translate }}</option>
              <option value="PUBLISHED">{{ 'admin.articleList.published' | translate }}</option>
              <option value="ARCHIVED">{{ 'admin.articleList.archived' | translate }}</option>
            </select>
            <button class="bulk-btn danger" (click)="bulkDelete()">{{ 'admin.articleList.bulkDelete' | translate }}</button>
            <button class="bulk-btn cancel" (click)="clearSelection()">{{ 'admin.articleList.bulkCancel' | translate }}</button>
          </div>
        </div>
      }

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll($event)" /></th>
              <th>{{ 'admin.articleList.status' | translate }}</th>
              <th>{{ 'admin.articleList.titleCol' | translate }}</th>
              <th>{{ 'admin.articleList.category' | translate }}</th>
              <th>{{ 'admin.articleList.authorCol' | translate }}</th>
              <th>{{ 'admin.articleList.date' | translate }}</th>
              <th>{{ 'admin.articleList.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (a of articles(); track a.id) {
              <tr [class.row-selected]="selectedIds.has(a.id)">
                <td class="td-check"><input type="checkbox" [checked]="selectedIds.has(a.id)" (change)="toggleSelect(a.id)" /></td>
                <td><span class="dot" [class]="a.status.toLowerCase()"></span></td>
                <td>
                  <a [routerLink]="['/admin/beitraege', a.id, 'bearbeiten']" class="title-link">{{ a.title }}</a>
                  @if (a.academic) { <span class="badge academic">📎</span> }
                  @if (a.featured) { <span class="badge featured">⭐</span> }
                </td>
                <td><span class="cat-pill" [style.color]="a.category.color">{{ a.category.emoji }} {{ a.category.displayName }}</span></td>
                <td>{{ a.author.name }}</td>
                <td>{{ a.publishedDate | dateDe }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/beitraege', a.id, 'bearbeiten']" class="action-btn">{{ 'admin.articleList.edit' | translate }}</a>
                  <button class="action-btn danger" (click)="deleteArticle(a.id)">{{ 'admin.articleList.delete' | translate }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
    </div>
  `,
  styles: [`
    .list-page h1 { font-family: 'Lora', serif; font-size: 1.4rem; font-weight: 700; color: #1e1e2e; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .btn-primary {
      padding: 0.5rem 1rem; background: #1e1e2e; color: #fff; border-radius: 6px;
      font-size: 0.82rem; font-weight: 700; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .toolbar {
      display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem;
    }
    .search-input, .toolbar select {
      padding: 0.45rem 0.7rem; border: 1px solid #e8e6e1; border-radius: 6px;
      font-family: inherit; font-size: 0.8rem; outline: none;
    }
    .search-input { flex: 1; min-width: 150px; }
    .checkbox-label { font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; color: #787774; }

    .bulk-bar {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem;
      padding: 0.6rem 0.9rem; margin-bottom: 0.8rem;
      background: #f0f8ff; border: 1px solid #b8d4e8; border-radius: 6px;
    }
    .bulk-count { font-size: 0.82rem; font-weight: 700; color: #1e1e2e; }
    .bulk-actions { display: flex; gap: 0.5rem; align-items: center; }
    .bulk-select {
      padding: 0.35rem 0.6rem; border: 1px solid #e8e6e1; border-radius: 6px;
      font-family: inherit; font-size: 0.78rem; outline: none; background: #fff; cursor: pointer;
    }
    .bulk-btn {
      padding: 0.35rem 0.7rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
      border: 1px solid #e8e6e1; cursor: pointer; transition: all 0.15s;
    }
    .bulk-btn.danger { background: #fff0f0; color: #c24a4a; border-color: #e8c4c4; }
    .bulk-btn.danger:hover { background: #fce6e6; color: #a03030; border-color: #c24a4a; }
    .bulk-btn.cancel { background: #f7f6f3; color: #787774; }
    .bulk-btn.cancel:hover { background: #e8e6e1; color: #37352f; }

    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e8e6e1; }
    th { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #787774; padding: 0.7rem 0.8rem; text-align: left; border-bottom: 1px solid #e8e6e1; background: #fafaf8; }
    td { padding: 0.6rem 0.8rem; font-size: 0.82rem; border-bottom: 1px solid #f1f0ec; }
    tr:hover td { background: #fafaf8; }
    tr.row-selected td { background: #f0f8ff; }
    .th-check, .td-check { width: 2rem; text-align: center; }
    .th-check input, .td-check input { cursor: pointer; accent-color: #1e1e2e; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.draft { background: #b4b3af; }
    .dot.published { background: #3a9e7e; }
    .dot.archived { background: #d4763e; }
    .title-link { font-weight: 600; color: #1e1e2e; }
    .title-link:hover { text-decoration: underline; }
    .badge { font-size: 0.7rem; margin-left: 0.3rem; }
    .cat-pill { font-size: 0.78rem; font-weight: 600; }
    .actions { display: flex; gap: 0.4rem; }
    .action-btn {
      padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600;
      background: #f7f6f3; color: #787774; border: 1px solid #e8e6e1; transition: all 0.15s;
      cursor: pointer;
    }
    .action-btn:hover { background: #e8e6e1; color: #37352f; }
    .action-btn.danger:hover { background: #fce6f1; color: #c24a8a; border-color: #c24a8a; }
  `]
})
export class ArticleListComponent implements OnInit {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private translate = inject(TranslateService);

  articles = signal<ArticleList[]>([]);
  categories = signal<Category[]>([]);
  page = signal(0);
  totalPages = signal(0);
  search = '';
  filterStatus = '';
  filterCategory = '';
  filterAcademic = false;
  private searchTimeout: any;

  selectedIds = new Set<number>();
  allSelected = false;

  ngOnInit() {
    this.loadArticles();
    this.categoryService.getAllCategories().subscribe(c => this.categories.set(c));
  }

  loadArticles() {
    const params: any = { page: this.page(), size: 15, sort: 'createdAt,desc' };
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterCategory) params.category = this.filterCategory;
    if (this.filterAcademic) params.academic = true;
    if (this.search) params.search = this.search;
    this.articleService.getAdminArticles(params).subscribe(res => {
      this.articles.set(res.content);
      this.totalPages.set(res.totalPages);
      this.updateAllSelected();
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadArticles(), 300);
  }

  onPage(p: number) {
    this.page.set(p);
    this.clearSelection();
    this.loadArticles();
  }

  deleteArticle(id: number) {
    if (confirm(this.translate.instant('admin.articleList.confirmDelete'))) {
      this.articleService.deleteArticle(id).subscribe(() => {
        this.selectedIds.delete(id);
        this.loadArticles();
      });
    }
  }

  toggleSelect(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.updateAllSelected();
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.articles().forEach(a => this.selectedIds.add(a.id));
    } else {
      this.articles().forEach(a => this.selectedIds.delete(a.id));
    }
    this.updateAllSelected();
  }

  clearSelection() {
    this.selectedIds.clear();
    this.allSelected = false;
  }

  private updateAllSelected() {
    const list = this.articles();
    this.allSelected = list.length > 0 && list.every(a => this.selectedIds.has(a.id));
  }

  bulkChangeStatus(event: Event) {
    const select = event.target as HTMLSelectElement;
    const status = select.value;
    if (!status || this.selectedIds.size === 0) return;
    const count = this.selectedIds.size;
    const key = count === 1 ? 'admin.articleList.confirmBulkStatusOne' : 'admin.articleList.confirmBulkStatusMany';
    if (!confirm(this.translate.instant(key, { count }))) {
      select.value = '';
      return;
    }
    const ids = Array.from(this.selectedIds);
    forkJoin(ids.map(id => this.articleService.changeStatus(id, status))).subscribe({
      next: () => { this.clearSelection(); this.loadArticles(); },
      error: () => this.loadArticles()
    });
    select.value = '';
  }

  bulkDelete() {
    const count = this.selectedIds.size;
    if (count === 0) return;
    const key = count === 1 ? 'admin.articleList.confirmBulkDeleteOne' : 'admin.articleList.confirmBulkDeleteMany';
    if (!confirm(this.translate.instant(key, { count }))) return;
    const ids = Array.from(this.selectedIds);
    forkJoin(ids.map(id => this.articleService.deleteArticle(id))).subscribe({
      next: () => { this.clearSelection(); this.loadArticles(); },
      error: () => this.loadArticles()
    });
  }
}
