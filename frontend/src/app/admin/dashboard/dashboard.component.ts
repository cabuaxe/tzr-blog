import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="dashboard">
      <h1>{{ 'admin.dashboard' | translate }}</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📝</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalArticles || 0 }}</span>
            <span class="stat-label">{{ 'admin.stats.articles' | translate }}</span>
          </div>
          <div class="stat-detail">
            <span class="dot draft"></span> {{ stats()?.draftArticles || 0 }} {{ 'admin.stats.drafts' | translate }}
            <span class="dot published"></span> {{ stats()?.publishedArticles || 0 }} {{ 'admin.stats.published' | translate }}
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📂</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.categories || 0 }}</span>
            <span class="stat-label">{{ 'admin.stats.categories' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👤</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.authors || 0 }}</span>
            <span class="stat-label">{{ 'admin.stats.authors' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📬</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.subscribers || 0 }}</span>
            <span class="stat-label">{{ 'admin.stats.newsletter' | translate }}</span>
          </div>
        </div>
      </div>

      <div class="recent-grid">
        <div class="recent-card">
          <h2>{{ 'admin.recentDrafts' | translate }}</h2>
          @for (a of recentDrafts(); track a.id) {
            <a [routerLink]="['/admin/beitraege', a.id, 'bearbeiten']" class="recent-item">
              <span class="dot draft"></span>
              <span class="item-title">{{ a.title }}</span>
            </a>
          }
          @if (!recentDrafts().length) {
            <p class="empty">{{ 'admin.noDrafts' | translate }}</p>
          }
        </div>
        <div class="recent-card">
          <h2>{{ 'admin.recentPublished' | translate }}</h2>
          @for (a of recentPublished(); track a.id) {
            <a [routerLink]="['/admin/beitraege', a.id, 'bearbeiten']" class="recent-item">
              <span class="dot published"></span>
              <span class="item-title">{{ a.title }}</span>
            </a>
          }
          @if (!recentPublished().length) {
            <p class="empty">{{ 'admin.noPublished' | translate }}</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h1 { font-family: 'Lora', serif; font-size: 1.4rem; font-weight: 700; color: #1e1e2e; margin-bottom: 1.5rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: #fff; border-radius: 10px; padding: 1.2rem;
      border: 1px solid #e8e6e1;
    }
    .stat-icon { font-size: 1.4rem; }
    .stat-info { margin-top: 0.5rem; }
    .stat-value { font-size: 1.6rem; font-weight: 800; color: #1e1e2e; display: block; }
    .stat-label { font-size: 0.78rem; color: #787774; }
    .stat-detail { margin-top: 0.5rem; font-size: 0.72rem; color: #787774; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.draft { background: #b4b3af; }
    .dot.published { background: #3a9e7e; }
    .dot.archived { background: #d4763e; }
    .recent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .recent-card {
      background: #fff; border-radius: 10px; padding: 1.2rem; border: 1px solid #e8e6e1;
    }
    .recent-card h2 { font-size: 0.88rem; font-weight: 700; color: #1e1e2e; margin-bottom: 0.8rem; }
    .recent-item {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0;
      font-size: 0.82rem; color: #37352f; transition: color 0.15s;
      min-width: 0;
    }
    .recent-item:hover { color: #3a9e7e; }
    .item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
    .empty { font-size: 0.8rem; color: #b4b3af; padding: 0.5rem 0; }
    @media (max-width: 960px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } .recent-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  stats = signal<any>(null);
  recentDrafts = signal<any[]>([]);
  recentPublished = signal<any[]>([]);

  ngOnInit() {
    this.http.get<any>(`${this.api}/admin/dashboard/stats`).subscribe(s => this.stats.set(s));
    this.http.get<any>(`${this.api}/admin/articles`, { params: { status: 'DRAFT', size: '5', sort: 'createdAt,desc' } })
      .subscribe(res => this.recentDrafts.set(res.content || []));
    this.http.get<any>(`${this.api}/admin/articles`, { params: { status: 'PUBLISHED', size: '5', sort: 'publishedDate,desc' } })
      .subscribe(res => this.recentPublished.set(res.content || []));
  }
}
