import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreate } from '../models/category.model';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);
  private api = environment.apiUrl;

  // Public endpoints
  getAllCategories(): Observable<Category[]> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<Category[]>(`${this.api}/public/categories`, { params });
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<Category>(`${this.api}/public/categories/${slug}`, { params });
  }

  // Admin endpoints
  getAdminCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/admin/categories`);
  }

  getAdminCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.api}/admin/categories/${id}`);
  }

  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${this.api}/admin/categories`, category);
  }

  updateCategory(id: number, category: CategoryCreate): Observable<Category> {
    return this.http.put<Category>(`${this.api}/admin/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/categories/${id}`);
  }

  reorder(orderedIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.api}/admin/categories/reorder`, { orderedIds });
  }
}
