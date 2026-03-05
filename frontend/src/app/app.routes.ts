import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { languageGuard } from './core/guards/language.guard';

const publicChildren = [
  { path: '', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent) },
  { path: 'artikel/:slug', loadComponent: () => import('./public/article-detail/article-detail.component').then(m => m.ArticleDetailComponent) },
  { path: 'artigo/:slug', loadComponent: () => import('./public/article-detail/article-detail.component').then(m => m.ArticleDetailComponent) },
  { path: 'article/:slug', loadComponent: () => import('./public/article-detail/article-detail.component').then(m => m.ArticleDetailComponent) },
  { path: 'bereiche', loadComponent: () => import('./public/category-list/category-list.component').then(m => m.CategoryListComponent) },
  { path: 'areas', loadComponent: () => import('./public/category-list/category-list.component').then(m => m.CategoryListComponent) },
  { path: 'bereiche/:slug', loadComponent: () => import('./public/category-detail/category-detail.component').then(m => m.CategoryDetailComponent) },
  { path: 'areas/:slug', loadComponent: () => import('./public/category-detail/category-detail.component').then(m => m.CategoryDetailComponent) },
  { path: 'autoren/:slug', loadComponent: () => import('./public/author-detail/author-detail.component').then(m => m.AuthorDetailComponent) },
  { path: 'autores/:slug', loadComponent: () => import('./public/author-detail/author-detail.component').then(m => m.AuthorDetailComponent) },
  { path: 'authors/:slug', loadComponent: () => import('./public/author-detail/author-detail.component').then(m => m.AuthorDetailComponent) },
  { path: 'thema/:slug', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'tema/:slug', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'topic/:slug', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'suche', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'pesquisa', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'search', loadComponent: () => import('./public/search-results/search-results.component').then(m => m.SearchResultsComponent) },
];

export const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'login', loadComponent: () => import('./admin/login/login.component').then(m => m.LoginComponent) },
      {
        path: '',
        loadComponent: () => import('./admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'beitraege', loadComponent: () => import('./admin/articles/article-list/article-list.component').then(m => m.ArticleListComponent) },
          { path: 'beitraege/neu', loadComponent: () => import('./admin/articles/article-form/article-form.component').then(m => m.ArticleFormComponent), canDeactivate: [unsavedChangesGuard] },
          { path: 'beitraege/:id/bearbeiten', loadComponent: () => import('./admin/articles/article-form/article-form.component').then(m => m.ArticleFormComponent), canDeactivate: [unsavedChangesGuard] },
          { path: 'kategorien', loadComponent: () => import('./admin/categories/category-list/category-list.component').then(m => m.AdminCategoryListComponent) },
          { path: 'kategorien/neu', loadComponent: () => import('./admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent) },
          { path: 'kategorien/:id/bearbeiten', loadComponent: () => import('./admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent) },
          { path: 'autoren', loadComponent: () => import('./admin/authors/author-list/author-list.component').then(m => m.AdminAuthorListComponent) },
          { path: 'autoren/neu', loadComponent: () => import('./admin/authors/author-form/author-form.component').then(m => m.AuthorFormComponent) },
          { path: 'autoren/:id/bearbeiten', loadComponent: () => import('./admin/authors/author-form/author-form.component').then(m => m.AuthorFormComponent) },
          { path: 'tags', loadComponent: () => import('./admin/tags/tag-manager/tag-manager.component').then(m => m.TagManagerComponent) },
        ]
      }
    ]
  },
  {
    path: ':lang',
    canActivate: [languageGuard],
    loadComponent: () => import('./public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: publicChildren,
  },
  { path: '', redirectTo: '/de', pathMatch: 'full' },
  { path: '**', redirectTo: '/de' }
];
