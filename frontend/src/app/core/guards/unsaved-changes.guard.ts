import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ArticleFormComponent } from '../../admin/articles/article-form/article-form.component';

export const unsavedChangesGuard: CanDeactivateFn<ArticleFormComponent> = (component) => {
  if (component.formDirty) {
    const translate = inject(TranslateService);
    return confirm(translate.instant('admin.unsavedChanges'));
  }
  return true;
};
