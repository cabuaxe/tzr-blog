import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author, AuthorCreate } from '../models/author.model';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);
  private api = environment.apiUrl;

  // Public endpoints
  getAuthorBySlug(slug: string): Observable<Author> {
    const params = new HttpParams().set('lang', this.langService.currentLang());
    return this.http.get<Author>(`${this.api}/public/authors/${slug}`, { params });
  }

  // Admin endpoints
  getAdminAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(`${this.api}/admin/authors`);
  }

  getAdminAuthor(id: number): Observable<Author> {
    return this.http.get<Author>(`${this.api}/admin/authors/${id}`);
  }

  createAuthor(author: AuthorCreate): Observable<Author> {
    return this.http.post<Author>(`${this.api}/admin/authors`, author);
  }

  updateAuthor(id: number, author: AuthorCreate): Observable<Author> {
    return this.http.put<Author>(`${this.api}/admin/authors/${id}`, author);
  }

  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/authors/${id}`);
  }
}
