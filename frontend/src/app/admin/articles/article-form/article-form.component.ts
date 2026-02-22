import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArticleService } from '../../../core/services/article.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthorService } from '../../../core/services/author.service';
import { TagService } from '../../../core/services/tag.service';
import { Article, ArticleCreate } from '../../../core/models/article.model';
import { Category } from '../../../core/models/category.model';
import { Author } from '../../../core/models/author.model';
import { Tag } from '../../../core/models/tag.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [FormsModule, RouterLink, QuillModule, TranslateModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <h1>{{ (isEdit() ? 'admin.articleForm.editArticle' : 'admin.articleForm.newArticle') | translate }}</h1>
        <div class="form-actions">
          <a routerLink="/admin/beitraege" class="btn-secondary">{{ 'admin.articleForm.cancel' | translate }}</a>
          <button class="btn-primary" (click)="save('DRAFT')">{{ 'admin.articleForm.saveDraft' | translate }}</button>
          <button class="btn-accent" (click)="save('PUBLISHED')">{{ 'admin.articleForm.publish' | translate }}</button>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-main">
          <div class="field">
            <label>{{ 'admin.articleForm.title' | translate }}</label>
            <input type="text" [(ngModel)]="form.title" (ngModelChange)="generateSlug()" [placeholder]="'admin.articleForm.titlePlaceholder' | translate" />
          </div>
          <div class="field">
            <label>{{ 'admin.articleForm.slug' | translate }}</label>
            <input type="text" [(ngModel)]="form.slug" [placeholder]="'admin.articleForm.slugPlaceholder' | translate" />
          </div>
          <div class="field">
            <label>{{ 'admin.articleForm.excerpt' | translate }}</label>
            <textarea [(ngModel)]="form.excerpt" rows="3" [placeholder]="'admin.articleForm.excerptPlaceholder' | translate"></textarea>
          </div>
          <div class="field editor-field">
            <div class="editor-header">
              <label>{{ 'admin.articleForm.body' | translate }}</label>
              <div class="editor-toolbar-extra">
                <span class="reading-time-badge">{{ 'admin.articleForm.readingTimeBadge' | translate:{min: estimatedReadingTime()} }}</span>
                <button type="button" class="source-toggle" (click)="toggleHtmlSource()">
                  {{ htmlSourceMode() ? ('admin.articleForm.visualMode' | translate) : ('admin.articleForm.sourceMode' | translate) }}
                </button>
              </div>
            </div>
            @if (!htmlSourceMode()) {
              <quill-editor
                #quillEditor
                [(ngModel)]="form.body"
                [modules]="quillModules"
                [styles]="{ minHeight: '400px' }"
                [placeholder]="'admin.articleForm.bodyPlaceholder' | translate"
                format="html"
                (onContentChanged)="onContentChanged()"
              ></quill-editor>
            } @else {
              <textarea
                class="html-source"
                [(ngModel)]="form.body"
                rows="20"
                [placeholder]="'admin.articleForm.htmlPlaceholder' | translate"
                (ngModelChange)="onContentChanged()"
              ></textarea>
            }
          </div>
        </div>

        <div class="form-sidebar">
          <div class="sidebar-section">
            <h3>{{ 'admin.articleForm.settings' | translate }}</h3>
            <div class="field">
              <label>{{ 'admin.articleForm.status' | translate }}</label>
              <select [(ngModel)]="form.status">
                <option value="DRAFT">{{ 'admin.articleForm.draft' | translate }}</option>
                <option value="PUBLISHED">{{ 'admin.articleForm.publishedStatus' | translate }}</option>
                <option value="ARCHIVED">{{ 'admin.articleForm.archived' | translate }}</option>
              </select>
            </div>
            <div class="field">
              <label>{{ 'admin.articleForm.publishDate' | translate }}</label>
              <input type="date" [(ngModel)]="form.publishedDate" />
            </div>
            <div class="field">
              <label>{{ 'admin.articleForm.category' | translate }}</label>
              <select [(ngModel)]="form.categoryId">
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.emoji }} {{ cat.displayName }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label>{{ 'admin.articleForm.author' | translate }}</label>
              <select [(ngModel)]="form.authorId">
                @for (a of authors(); track a.id) {
                  <option [value]="a.id">{{ a.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>{{ 'admin.articleForm.tags' | translate }}</h3>
            <div class="tags-select">
              @for (tag of allTags(); track tag.id) {
                <label class="tag-option">
                  <input type="checkbox" [checked]="isTagSelected(tag.id)" (change)="toggleTag(tag.id)" />
                  {{ tag.name }}
                </label>
              }
            </div>
            <div class="inline-tag-create">
              <input type="text" [(ngModel)]="newTagName" [placeholder]="'admin.articleForm.addTag' | translate" (keydown.enter)="createTag()" />
              <button type="button" (click)="createTag()" [disabled]="!newTagName.trim()">+</button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>{{ 'admin.articleForm.display' | translate }}</h3>
            <div class="field">
              <label>{{ 'admin.articleForm.emoji' | translate }}</label>
              <input type="text" [(ngModel)]="form.cardEmoji" placeholder="🎯" />
            </div>
            <div class="field">
              <label>{{ 'admin.articleForm.coverImage' | translate }}</label>
              <input type="text" [(ngModel)]="form.coverImageUrl" placeholder="https://…" />
            </div>
            @if (form.coverImageUrl) {
              <img [src]="form.coverImageUrl + '?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'" class="cover-preview" alt="Cover" />
            }
            <div class="field">
              <label>{{ 'admin.articleForm.coverImageCredit' | translate }}</label>
              <input type="text" [(ngModel)]="form.coverImageCredit" [placeholder]="'admin.articleForm.coverImageCreditPlaceholder' | translate" />
            </div>
            <div class="toggle-row">
              <label><input type="checkbox" [(ngModel)]="form.academic" /> {{ 'admin.articleForm.academic' | translate }}</label>
              <label><input type="checkbox" [(ngModel)]="form.featured" /> {{ 'admin.articleForm.featured' | translate }}</label>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>{{ 'admin.articleForm.seo' | translate }}</h3>
            <div class="field">
              <label>{{ 'admin.articleForm.metaTitle' | translate }}</label>
              <input type="text" [(ngModel)]="form.metaTitle" [placeholder]="'admin.articleForm.metaTitlePlaceholder' | translate" />
            </div>
            <div class="field">
              <label>{{ 'admin.articleForm.metaDescription' | translate }}</label>
              <textarea [(ngModel)]="form.metaDescription" rows="2" [placeholder]="'admin.articleForm.metaDescriptionPlaceholder' | translate"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page h1 { font-family: 'Lora', serif; font-size: 1.3rem; font-weight: 700; color: #1e1e2e; }
    .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .form-actions { display: flex; gap: 0.5rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1e1e2e; color: #fff; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .btn-accent { padding: 0.5rem 1rem; background: #3a9e7e; color: #fff; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .btn-secondary { padding: 0.5rem 1rem; background: #f7f6f3; color: #787774; border-radius: 6px; font-size: 0.82rem; font-weight: 600; border: 1px solid #e8e6e1; }
    .form-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    .form-main, .sidebar-section {
      background: #fff; border-radius: 10px; padding: 1.2rem; border: 1px solid #e8e6e1;
    }
    .sidebar-section { margin-bottom: 1rem; }
    .sidebar-section h3 { font-size: 0.82rem; font-weight: 700; color: #1e1e2e; margin-bottom: 0.8rem; padding-bottom: 0.4rem; border-bottom: 1px solid #f1f0ec; }
    .field { margin-bottom: 0.8rem; }
    .field label { display: block; font-size: 0.75rem; font-weight: 600; color: #787774; margin-bottom: 0.25rem; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #e8e6e1; border-radius: 6px;
      font-family: inherit; font-size: 0.82rem; outline: none; transition: border-color 0.2s;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: #787774; }
    .editor-field :host ::ng-deep .ql-container { font-family: 'Nunito', sans-serif; font-size: 0.92rem; line-height: 1.7; }
    .editor-field :host ::ng-deep .ql-editor { min-height: 400px; }
    .editor-field :host ::ng-deep .ql-toolbar { border-radius: 6px 6px 0 0; border-color: #e8e6e1; background: #faf9f7; }
    .editor-field :host ::ng-deep .ql-container { border-radius: 0 0 6px 6px; border-color: #e8e6e1; }
    .editor-field :host ::ng-deep .ql-editor h2 { font-family: 'Lora', serif; font-size: 1.2rem; font-weight: 600; margin: 1.2rem 0 0.5rem; }
    .editor-field :host ::ng-deep .ql-editor h3 { font-family: 'Lora', serif; font-size: 1.05rem; font-weight: 600; margin: 1rem 0 0.4rem; }
    .editor-field :host ::ng-deep .ql-editor blockquote { border-left: 3px solid #4a7fd4; background: #e6effb; padding: 0.8rem 1rem; border-radius: 0 6px 6px 0; margin: 1rem 0; }
    .editor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
    .editor-toolbar-extra { display: flex; align-items: center; gap: 0.5rem; }
    .reading-time-badge { font-size: 0.7rem; color: #787774; background: #f7f6f3; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .source-toggle {
      font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px;
      background: #f7f6f3; color: #787774; border: 1px solid #e8e6e1; cursor: pointer;
    }
    .source-toggle:hover { background: #e8e6e1; color: #37352f; }
    .html-source {
      width: 100%; padding: 0.8rem; border: 1px solid #e8e6e1; border-radius: 6px;
      font-family: 'Courier New', monospace; font-size: 0.82rem; line-height: 1.6;
      outline: none; resize: vertical; min-height: 400px;
    }
    .html-source:focus { border-color: #787774; }
    .tags-select { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .tag-option { font-size: 0.75rem; display: flex; align-items: center; gap: 0.2rem; padding: 0.2rem 0.4rem; background: #f7f6f3; border-radius: 4px; cursor: pointer; }
    .inline-tag-create { display: flex; gap: 0.3rem; margin-top: 0.5rem; }
    .inline-tag-create input {
      flex: 1; padding: 0.3rem 0.5rem; border: 1px solid #e8e6e1; border-radius: 4px;
      font-family: inherit; font-size: 0.75rem; outline: none;
    }
    .inline-tag-create input:focus { border-color: #787774; }
    .inline-tag-create button {
      padding: 0.3rem 0.6rem; background: #3a9e7e; color: #fff; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700; cursor: pointer;
    }
    .inline-tag-create button:disabled { opacity: 0.4; cursor: default; }
    .cover-preview { width: 100%; border-radius: 6px; margin: 0.5rem 0; }
    .toggle-row { display: flex; gap: 1rem; font-size: 0.8rem; }
    .toggle-row label { display: flex; align-items: center; gap: 0.3rem; }
    @media (max-width: 960px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class ArticleFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private authorService = inject(AuthorService);
  private tagService = inject(TagService);
  private translate = inject(TranslateService);

  @ViewChild('quillEditor') quillEditor!: QuillEditorComponent;

  isEdit = signal(false);
  articleId = signal<number | null>(null);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  allTags = signal<Tag[]>([]);
  htmlSourceMode = signal(false);
  estimatedReadingTime = signal(0);
  newTagName = '';
  formDirty = false;

  quillModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  form: ArticleCreate & { coverImageCredit?: string } = {
    title: '', slug: '', excerpt: '', body: '',
    categoryId: 0, authorId: 0, tagIds: [],
    cardEmoji: '', coverImageUrl: '', coverImageCredit: '',
    status: 'DRAFT', academic: false, featured: false,
    publishedDate: '', metaTitle: '', metaDescription: ''
  };

  ngOnInit() {
    this.categoryService.getAdminCategories().subscribe(c => this.categories.set(c));
    this.authorService.getAdminAuthors().subscribe(a => this.authors.set(a));
    this.tagService.getAllTags().subscribe(t => this.allTags.set(t));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.articleId.set(+id);
      this.articleService.getAdminArticle(+id).subscribe(a => {
        this.form = {
          title: a.title, slug: a.slug, excerpt: a.excerpt, body: a.body,
          categoryId: a.category.id, authorId: a.author.id,
          tagIds: a.tags.map(t => t.id),
          cardEmoji: a.cardEmoji || '', coverImageUrl: a.coverImageUrl || '',
          coverImageCredit: a.coverImageCredit || '',
          status: a.status, academic: a.academic, featured: a.featured,
          publishedDate: a.publishedDate || '', readingTimeMinutes: a.readingTimeMinutes,
          metaTitle: a.metaTitle || '', metaDescription: a.metaDescription || ''
        };
        this.calculateReadingTime();
      });
    }
  }

  generateSlug() {
    if (!this.isEdit() || !this.form.slug) {
      this.form.slug = this.form.title
        .toLowerCase()
        .replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  }

  isTagSelected(id: number): boolean {
    return this.form.tagIds?.includes(id) || false;
  }

  toggleTag(id: number) {
    const ids = this.form.tagIds || [];
    const i = ids.indexOf(id);
    if (i >= 0) ids.splice(i, 1);
    else ids.push(id);
    this.form.tagIds = [...ids];
  }

  toggleHtmlSource() {
    this.htmlSourceMode.update(v => !v);
  }

  onContentChanged() {
    this.formDirty = true;
    this.calculateReadingTime();
  }

  calculateReadingTime() {
    const text = (this.form.body || '').replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    this.estimatedReadingTime.set(Math.max(1, Math.round(words / 200)));
  }

  createTag() {
    const name = this.newTagName.trim();
    if (!name) return;
    this.tagService.createTag(name).subscribe({
      next: (tag) => {
        this.allTags.update(tags => [...tags, tag]);
        this.form.tagIds = [...(this.form.tagIds || []), tag.id];
        this.newTagName = '';
      },
      error: (err) => alert(this.translate.instant('admin.articleForm.tagError') + ': ' + (err.error?.message || err.message))
    });
  }

  save(status: string) {
    this.form.status = status;
    if (status === 'PUBLISHED' && !this.form.publishedDate) {
      this.form.publishedDate = new Date().toISOString().split('T')[0];
    }
    this.calculateReadingTime();
    this.form.readingTimeMinutes = this.estimatedReadingTime();
    const obs = this.isEdit()
      ? this.articleService.updateArticle(this.articleId()!, this.form)
      : this.articleService.createArticle(this.form);
    obs.subscribe({
      next: () => {
        this.formDirty = false;
        this.router.navigate(['/admin/beitraege']);
      },
      error: (err) => alert(this.translate.instant('admin.articleForm.saveError') + ': ' + (err.error?.message || err.message))
    });
  }
}
