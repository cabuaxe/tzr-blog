import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleList, ArticleCreate } from '../models/article.model';
import { PageResponse } from '../models/page.model';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);
  private api = environment.apiUrl;

  // Public endpoints
  getPublishedArticles(params: { page?: number; size?: number; category?: string; author?: string; type?: string; academic?: boolean; tag?: string; sort?: string } = {}): Observable<PageResponse<ArticleList>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.author) httpParams = httpParams.set('author', params.author);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.academic !== undefined) httpParams = httpParams.set('academic', params.academic);
    if (params.tag) httpParams = httpParams.set('tag', params.tag);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    httpParams = httpParams.set('lang', this.langService.currentLang());
    return this.http.get<PageResponse<ArticleList>>(`${this.api}/public/articles`, { params: httpParams });
  }

  getArticleBySlug(slug: string): Observable<Article> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<Article>(`${this.api}/public/articles/${slug}`, { params });
  }

  getFeaturedArticle(): Observable<Article> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<Article>(`${this.api}/public/articles/featured`, { params });
  }

  searchArticles(q: string, page = 0, size = 12): Observable<PageResponse<ArticleList>> {
    return this.http.get<PageResponse<ArticleList>>(`${this.api}/public/articles/search`, { params: { q, page, size, lang: this.langService.currentLang() } });
  }

  getRelatedArticles(slug: string): Observable<PageResponse<ArticleList>> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<PageResponse<ArticleList>>(`${this.api}/public/articles/${slug}/related`, { params });
  }

  // Admin endpoints
  getAdminArticles(params: any = {}): Observable<PageResponse<ArticleList>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<PageResponse<ArticleList>>(`${this.api}/admin/articles`, { params: httpParams });
  }

  getAdminArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.api}/admin/articles/${id}`);
  }

  createArticle(article: ArticleCreate): Observable<Article> {
    return this.http.post<Article>(`${this.api}/admin/articles`, article);
  }

  updateArticle(id: number, article: ArticleCreate): Observable<Article> {
    return this.http.put<Article>(`${this.api}/admin/articles/${id}`, article);
  }

  deleteArticle(id: number, hard = false): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/articles/${id}`, { params: hard ? { hard: true } : {} });
  }

  changeStatus(id: number, status: string): Observable<Article> {
    return this.http.patch<Article>(`${this.api}/admin/articles/${id}/status`, { status });
  }

  toggleFeatured(id: number): Observable<Article> {
    return this.http.patch<Article>(`${this.api}/admin/articles/${id}/featured`, {});
  }
}
