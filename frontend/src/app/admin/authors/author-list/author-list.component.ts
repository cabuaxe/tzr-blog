import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthorService } from '../../../core/services/author.service';
import { Author } from '../../../core/models/author.model';

@Component({
  selector: 'app-admin-author-list',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="list-page">
      <div class="page-header">
        <h1>{{ 'admin.authorList.title' | translate }}</h1>
        <a routerLink="/admin/autoren/neu" class="btn-primary">+ {{ 'admin.authorList.newAuthor' | translate }}</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>{{ 'admin.authorList.name' | translate }}</th>
              <th>{{ 'admin.authorList.email' | translate }}</th>
              <th>{{ 'admin.authorList.articleCount' | translate }}</th>
              <th>{{ 'admin.authorList.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (a of authors(); track a.id) {
              <tr>
                <td>
                  @if (a.avatarUrl) {
                    <img [src]="a.avatarUrl" class="avatar" />
                  } @else {
                    <div class="avatar-placeholder">{{ a.name.charAt(0) }}</div>
                  }
                </td>
                <td class="name">{{ a.name }}</td>
                <td>{{ a.email }}</td>
                <td>{{ a.articleCount }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/autoren', a.id, 'bearbeiten']" class="action-btn">{{ 'admin.authorList.edit' | translate }}</a>
                  <button class="action-btn danger" (click)="deleteAuthor(a)">{{ 'admin.authorList.delete' | translate }}</button>
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
    td { padding: 0.6rem 0.8rem; font-size: 0.82rem; border-bottom: 1px solid #f1f0ec; vertical-align: middle; }
    tr:hover td { background: #fafaf8; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { width: 32px; height: 32px; border-radius: 50%; background: #f7f6f3; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #787774; }
    .name { font-weight: 600; }
    .actions { display: flex; gap: 0.4rem; }
    .action-btn { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: #f7f6f3; color: #787774; border: 1px solid #e8e6e1; cursor: pointer; }
    .action-btn:hover { background: #e8e6e1; color: #37352f; }
    .action-btn.danger:hover { background: #fce6f1; color: #c24a8a; border-color: #c24a8a; }
  `]
})
export class AdminAuthorListComponent implements OnInit {
  private authorService = inject(AuthorService);
  private translate = inject(TranslateService);
  authors = signal<Author[]>([]);

  ngOnInit() { this.loadAuthors(); }

  loadAuthors() {
    this.authorService.getAdminAuthors().subscribe(a => this.authors.set(a));
  }

  deleteAuthor(a: Author) {
    if (a.articleCount > 0) {
      alert(this.translate.instant('admin.authorList.cannotDelete', { name: a.name, count: a.articleCount }));
      return;
    }
    if (confirm(this.translate.instant('admin.authorList.confirmDelete', { name: a.name }))) {
      this.authorService.deleteAuthor(a.id).subscribe({
        next: () => this.loadAuthors(),
        error: (err) => alert(err.error?.message || this.translate.instant('admin.authorList.deleteError'))
      });
    }
  }
}
