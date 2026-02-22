import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/models/tag.model';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="tag-page">
      <div class="page-header">
        <h1>{{ 'admin.tagManager.title' | translate }}</h1>
      </div>

      <div class="create-row">
        <input type="text" [(ngModel)]="newTagName" [placeholder]="'admin.tagManager.newTag' | translate" (keyup.enter)="createTag()" />
        <button class="btn-primary" (click)="createTag()">{{ 'admin.tagManager.create' | translate }}</button>
      </div>

      <div class="tag-list">
        @for (tag of tags(); track tag.id) {
          <div class="tag-item">
            @if (editingId() === tag.id) {
              <input type="text" [(ngModel)]="editingName" (keyup.enter)="saveEdit(tag)" (keyup.escape)="cancelEdit()" autofocus class="edit-input" />
              <button class="action-btn" (click)="saveEdit(tag)">&#10003;</button>
              <button class="action-btn" (click)="cancelEdit()">&#10005;</button>
            } @else {
              <span class="tag-name" (click)="startEdit(tag)">{{ tag.name }}</span>
              <span class="tag-count">{{ 'admin.tagManager.articleCount' | translate:{count: tag.articleCount} }}</span>
              <button class="action-btn" (click)="startEdit(tag)" [title]="'admin.tagManager.rename' | translate">&#9998;</button>
              <button class="action-btn" (click)="selectForMerge(tag)" [title]="'admin.tagManager.merge' | translate" [class.selected]="mergeSource()?.id === tag.id">&#128279;</button>
              <button class="action-btn danger" (click)="deleteTag(tag)" [title]="'admin.tagManager.delete' | translate">&#128465;</button>
            }
          </div>
        }
      </div>

      @if (mergeSource()) {
        <div class="merge-bar">
          <span>{{ 'admin.tagManager.mergeWith' | translate:{name: mergeSource()!.name} }}</span>
          <select [(ngModel)]="mergeTargetId">
            @for (tag of tags(); track tag.id) {
              @if (tag.id !== mergeSource()!.id) {
                <option [value]="tag.id">{{ tag.name }}</option>
              }
            }
          </select>
          <button class="btn-primary" (click)="merge()">{{ 'admin.tagManager.mergeBtn' | translate }}</button>
          <button class="btn-secondary" (click)="cancelMerge()">{{ 'admin.tagManager.mergeCancel' | translate }}</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .tag-page h1 { font-family: 'Lora', serif; font-size: 1.4rem; font-weight: 700; color: #1e1e2e; }
    .page-header { margin-bottom: 1.5rem; }
    .create-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .create-row input {
      flex: 1; max-width: 300px; padding: 0.5rem 0.7rem; border: 1px solid #e8e6e1;
      border-radius: 6px; font-family: inherit; font-size: 0.82rem; outline: none;
    }
    .btn-primary { padding: 0.5rem 1rem; background: #1e1e2e; color: #fff; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
    .btn-secondary { padding: 0.5rem 1rem; background: #f7f6f3; color: #787774; border-radius: 6px; font-size: 0.82rem; border: 1px solid #e8e6e1; }
    .tag-list { background: #fff; border: 1px solid #e8e6e1; border-radius: 10px; overflow: hidden; }
    .tag-item {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem;
      border-bottom: 1px solid #f1f0ec; transition: background 0.1s;
    }
    .tag-item:last-child { border-bottom: none; }
    .tag-item:hover { background: #fafaf8; }
    .tag-name { font-size: 0.85rem; font-weight: 600; color: #1e1e2e; cursor: pointer; flex: 1; }
    .tag-count { font-size: 0.72rem; color: #b4b3af; }
    .edit-input { flex: 1; padding: 0.3rem 0.5rem; border: 1px solid #787774; border-radius: 4px; font-family: inherit; font-size: 0.82rem; }
    .action-btn {
      padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem;
      background: none; color: #787774; border: none; cursor: pointer; transition: all 0.15s;
    }
    .action-btn:hover { background: #f7f6f3; }
    .action-btn.danger:hover { color: #c24a8a; }
    .action-btn.selected { background: #e6effb; color: #4a7fd4; }
    .merge-bar {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      margin-top: 1rem; padding: 1rem; background: #e6effb; border-radius: 8px;
      font-size: 0.82rem;
    }
    .merge-bar select { padding: 0.4rem 0.6rem; border: 1px solid #e8e6e1; border-radius: 6px; font-family: inherit; font-size: 0.82rem; }
  `]
})
export class TagManagerComponent implements OnInit {
  private tagService = inject(TagService);
  private translate = inject(TranslateService);

  tags = signal<Tag[]>([]);
  newTagName = '';
  editingId = signal<number | null>(null);
  editingName = '';
  mergeSource = signal<Tag | null>(null);
  mergeTargetId = 0;

  ngOnInit() { this.loadTags(); }

  loadTags() {
    this.tagService.getAllTags().subscribe(t => this.tags.set(t));
  }

  createTag() {
    if (!this.newTagName.trim()) return;
    this.tagService.createTag(this.newTagName.trim()).subscribe(() => {
      this.newTagName = '';
      this.loadTags();
    });
  }

  startEdit(tag: Tag) {
    this.editingId.set(tag.id);
    this.editingName = tag.name;
  }

  saveEdit(tag: Tag) {
    if (this.editingName.trim() && this.editingName !== tag.name) {
      this.tagService.updateTag(tag.id, this.editingName.trim()).subscribe(() => {
        this.editingId.set(null);
        this.loadTags();
      });
    } else {
      this.cancelEdit();
    }
  }

  cancelEdit() { this.editingId.set(null); }

  deleteTag(tag: Tag) {
    const msg = tag.articleCount > 0
      ? this.translate.instant('admin.tagManager.confirmDeleteWithArticles', { name: tag.name, count: tag.articleCount })
      : this.translate.instant('admin.tagManager.confirmDelete', { name: tag.name });
    if (confirm(msg)) {
      this.tagService.deleteTag(tag.id).subscribe(() => this.loadTags());
    }
  }

  selectForMerge(tag: Tag) {
    if (this.mergeSource()?.id === tag.id) { this.cancelMerge(); return; }
    this.mergeSource.set(tag);
  }

  cancelMerge() { this.mergeSource.set(null); this.mergeTargetId = 0; }

  merge() {
    if (!this.mergeSource() || !this.mergeTargetId) return;
    this.tagService.mergeTags(this.mergeSource()!.id, this.mergeTargetId).subscribe(() => {
      this.cancelMerge();
      this.loadTags();
    });
  }
}
