import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryCreate } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <h1>{{ (isEdit() ? 'admin.categoryForm.editCategory' : 'admin.categoryForm.newCategory') | translate }}</h1>
        <div class="form-actions">
          <a routerLink="/admin/kategorien" class="btn-secondary">{{ 'admin.categoryForm.cancel' | translate }}</a>
          <button class="btn-primary" (click)="save()">{{ 'admin.categoryForm.save' | translate }}</button>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-main">
          <div class="field"><label>{{ 'admin.categoryForm.name' | translate }}</label><input type="text" [(ngModel)]="form.name" /></div>
          <div class="field"><label>{{ 'admin.categoryForm.displayName' | translate }}</label><input type="text" [(ngModel)]="form.displayName" /></div>
          <div class="field"><label>{{ 'admin.categoryForm.slug' | translate }}</label><input type="text" [(ngModel)]="form.slug" /></div>
          <div class="field"><label>{{ 'admin.categoryForm.description' | translate }}</label><textarea [(ngModel)]="form.description" rows="3"></textarea></div>
          <div class="field"><label>{{ 'admin.categoryForm.emoji' | translate }}</label><input type="text" [(ngModel)]="form.emoji" /></div>
          <div class="row">
            <div class="field"><label>{{ 'admin.categoryForm.color' | translate }}</label><input type="color" [(ngModel)]="form.color" /></div>
            <div class="field"><label>{{ 'admin.categoryForm.bgColor' | translate }}</label><input type="color" [(ngModel)]="form.bgColor" /></div>
          </div>
          <div class="field">
            <label>{{ 'admin.categoryForm.type' | translate }}</label>
            <select [(ngModel)]="form.type">
              <option value="BILDUNGSBEREICH">{{ 'admin.categoryForm.educational' | translate }}</option>
              <option value="QUERSCHNITTSAUFGABE">{{ 'admin.categoryForm.crossCutting' | translate }}</option>
            </select>
          </div>
          <div class="field"><label>{{ 'admin.categoryForm.sortOrder' | translate }}</label><input type="number" [(ngModel)]="form.sortOrder" /></div>
        </div>
        <div class="preview-card">
          <h3>{{ 'admin.categoryForm.preview' | translate }}</h3>
          <div class="card-preview" [style.border-left-color]="form.color">
            <span class="emoji">{{ form.emoji }}</span>
            <h4 [style.color]="form.color">{{ form.displayName || ('admin.categoryForm.previewCategory' | translate) }}</h4>
            <p>{{ form.description || ('admin.categoryForm.previewDescription' | translate) }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page h1 { font-family: 'Lora', serif; font-size: 1.3rem; font-weight: 700; color: #1e1e2e; }
    .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .form-actions { display: flex; gap: 0.5rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1e1e2e; color: #fff; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .btn-secondary { padding: 0.5rem 1rem; background: #f7f6f3; color: #787774; border-radius: 6px; font-size: 0.82rem; font-weight: 600; border: 1px solid #e8e6e1; }
    .form-grid { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
    .form-main, .preview-card { background: #fff; border-radius: 10px; padding: 1.2rem; border: 1px solid #e8e6e1; }
    .field { margin-bottom: 0.8rem; }
    .field label { display: block; font-size: 0.75rem; font-weight: 600; color: #787774; margin-bottom: 0.25rem; }
    .field input, .field select, .field textarea { width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #e8e6e1; border-radius: 6px; font-family: inherit; font-size: 0.82rem; outline: none; }
    .field input[type="color"] { height: 36px; padding: 2px; }
    .row { display: flex; gap: 1rem; }
    .row .field { flex: 1; }
    .preview-card h3 { font-size: 0.82rem; font-weight: 700; margin-bottom: 0.8rem; color: #787774; }
    .card-preview { padding: 1rem; border-left: 4px solid #e8e6e1; border-radius: 8px; background: #fafaf8; }
    .emoji { font-size: 1.8rem; }
    .card-preview h4 { font-family: 'Lora', serif; font-weight: 600; font-size: 1rem; margin: 0.3rem 0; }
    .card-preview p { font-size: 0.8rem; color: #787774; }
    @media (max-width: 960px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class CategoryFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  categoryId = signal<number | null>(null);
  form: CategoryCreate = { name: '', displayName: '', slug: '', description: '', emoji: '', color: '#3a9e7e', bgColor: '#e5f5ef', type: 'BILDUNGSBEREICH', sortOrder: 0 };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.categoryId.set(+id);
      this.categoryService.getAdminCategory(+id).subscribe(c => {
        this.form = { name: c.name, displayName: c.displayName, slug: c.slug, description: c.description, emoji: c.emoji, color: c.color, bgColor: c.bgColor, type: c.type, sortOrder: c.sortOrder };
      });
    }
  }

  save() {
    const obs = this.isEdit()
      ? this.categoryService.updateCategory(this.categoryId()!, this.form)
      : this.categoryService.createCategory(this.form);
    obs.subscribe({
      next: () => this.router.navigate(['/admin/kategorien']),
      error: (err) => alert(err.error?.message || this.translate.instant('admin.categoryForm.saveError'))
    });
  }
}
