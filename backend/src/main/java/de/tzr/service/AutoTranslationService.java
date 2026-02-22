package de.tzr.service;

import de.tzr.config.TranslationProperties;
import de.tzr.model.*;
import de.tzr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoTranslationService {

    private final TranslationProperties props;
    private final DeepLTranslationClient deepLClient;
    private final ClaudeTranslationClient claudeClient;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final TagRepository tagRepository;
    private final ArticleTranslationRepository articleTranslationRepository;
    private final CategoryTranslationRepository categoryTranslationRepository;
    private final AuthorTranslationRepository authorTranslationRepository;
    private final TagTranslationRepository tagTranslationRepository;
    private final TranslationTaskRepository translationTaskRepository;

    @Async
    public void translateArticle(Long articleId, Language sourceLang) {
        if (!props.isAutoTranslate()) return;
        log.info("Auto-translating article {} from {}", articleId, sourceLang);

        for (Language targetLang : targetLanguages(sourceLang)) {
            try {
                translateArticleToLang(articleId, sourceLang, targetLang);
            } catch (Exception e) {
                log.error("Failed to auto-translate article {} to {}: {}", articleId, targetLang, e.getMessage());
            }
        }
    }

    @Transactional
    protected void translateArticleToLang(Long articleId, Language sourceLang, Language targetLang) {
        Article article = articleRepository.findById(articleId).orElse(null);
        if (article == null) return;

        String sourceTitle = getArticleField(article, sourceLang, "title");
        String sourceExcerpt = getArticleField(article, sourceLang, "excerpt");
        String sourceBody = getArticleField(article, sourceLang, "body");
        String sourceMetaTitle = getArticleField(article, sourceLang, "metaTitle");
        String sourceMetaDesc = getArticleField(article, sourceLang, "metaDescription");

        String translatedTitle = translateShort(sourceTitle, sourceLang, targetLang);
        String translatedExcerpt = translateShort(sourceExcerpt, sourceLang, targetLang);
        String translatedBody = translateLong(sourceBody, sourceLang, targetLang);
        String translatedMetaTitle = translateShort(sourceMetaTitle, sourceLang, targetLang);
        String translatedMetaDesc = translateShort(sourceMetaDesc, sourceLang, targetLang);

        if (translatedTitle == null && translatedBody == null) {
            log.warn("No translations produced for article {} -> {}", articleId, targetLang);
            return;
        }

        ArticleTranslation translation = articleTranslationRepository
            .findByArticleIdAndLanguage(articleId, targetLang)
            .orElse(ArticleTranslation.builder()
                .article(article)
                .language(targetLang)
                .build());

        if (translatedTitle != null) translation.setTitle(translatedTitle);
        if (translatedExcerpt != null) translation.setExcerpt(translatedExcerpt);
        if (translatedBody != null) translation.setBody(translatedBody);
        if (translatedMetaTitle != null) translation.setMetaTitle(translatedMetaTitle);
        if (translatedMetaDesc != null) translation.setMetaDescription(translatedMetaDesc);
        translation.setReadingTimeMinutes(article.getReadingTimeMinutes());

        articleTranslationRepository.save(translation);
        markTaskDone(TranslationTaskEntityType.ARTICLE, articleId, targetLang);
        log.info("Auto-translated article {} to {}", articleId, targetLang);
    }

    @Async
    public void translateCategory(Long categoryId, Language sourceLang) {
        if (!props.isAutoTranslate()) return;
        log.info("Auto-translating category {} from {}", categoryId, sourceLang);

        for (Language targetLang : targetLanguages(sourceLang)) {
            try {
                translateCategoryToLang(categoryId, sourceLang, targetLang);
            } catch (Exception e) {
                log.error("Failed to auto-translate category {} to {}: {}", categoryId, targetLang, e.getMessage());
            }
        }
    }

    @Transactional
    protected void translateCategoryToLang(Long categoryId, Language sourceLang, Language targetLang) {
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) return;

        String sourceName = getCategoryField(category, sourceLang, "name");
        String sourceDisplayName = getCategoryField(category, sourceLang, "displayName");
        String sourceDesc = getCategoryField(category, sourceLang, "description");

        String translatedName = translateShort(sourceName, sourceLang, targetLang);
        String translatedDisplayName = translateShort(sourceDisplayName, sourceLang, targetLang);
        String translatedDesc = translateShort(sourceDesc, sourceLang, targetLang);

        if (translatedName == null && translatedDisplayName == null) return;

        CategoryTranslation translation = categoryTranslationRepository
            .findByCategoryIdAndLanguage(categoryId, targetLang)
            .orElse(CategoryTranslation.builder()
                .category(category)
                .language(targetLang)
                .build());

        if (translatedName != null) translation.setName(translatedName);
        if (translatedDisplayName != null) translation.setDisplayName(translatedDisplayName);
        if (translatedDesc != null) translation.setDescription(translatedDesc);

        categoryTranslationRepository.save(translation);
        markTaskDone(TranslationTaskEntityType.CATEGORY, categoryId, targetLang);
        log.info("Auto-translated category {} to {}", categoryId, targetLang);
    }

    @Async
    public void translateAuthor(Long authorId, Language sourceLang) {
        if (!props.isAutoTranslate()) return;
        log.info("Auto-translating author {} from {}", authorId, sourceLang);

        for (Language targetLang : targetLanguages(sourceLang)) {
            try {
                translateAuthorToLang(authorId, sourceLang, targetLang);
            } catch (Exception e) {
                log.error("Failed to auto-translate author {} to {}: {}", authorId, targetLang, e.getMessage());
            }
        }
    }

    @Transactional
    protected void translateAuthorToLang(Long authorId, Language sourceLang, Language targetLang) {
        Author author = authorRepository.findById(authorId).orElse(null);
        if (author == null) return;

        String sourceBio = getAuthorBio(author, sourceLang);
        String translatedBio = translateLong(sourceBio, sourceLang, targetLang);

        if (translatedBio == null) return;

        AuthorTranslation translation = authorTranslationRepository
            .findByAuthorIdAndLanguage(authorId, targetLang)
            .orElse(AuthorTranslation.builder()
                .author(author)
                .language(targetLang)
                .build());

        translation.setBio(translatedBio);

        authorTranslationRepository.save(translation);
        markTaskDone(TranslationTaskEntityType.AUTHOR, authorId, targetLang);
        log.info("Auto-translated author {} to {}", authorId, targetLang);
    }

    @Async
    public void translateTag(Long tagId, Language sourceLang) {
        if (!props.isAutoTranslate()) return;
        log.info("Auto-translating tag {} from {}", tagId, sourceLang);

        for (Language targetLang : targetLanguages(sourceLang)) {
            try {
                translateTagToLang(tagId, sourceLang, targetLang);
            } catch (Exception e) {
                log.error("Failed to auto-translate tag {} to {}: {}", tagId, targetLang, e.getMessage());
            }
        }
    }

    @Transactional
    protected void translateTagToLang(Long tagId, Language sourceLang, Language targetLang) {
        Tag tag = tagRepository.findById(tagId).orElse(null);
        if (tag == null) return;

        String sourceName = tag.getName();
        if (sourceLang != Language.DEFAULT) {
            TagTranslation st = tag.getTranslations().get(sourceLang);
            if (st != null) sourceName = st.getName();
        }

        String translatedName = translateShort(sourceName, sourceLang, targetLang);
        if (translatedName == null) return;

        TagTranslation translation = tagTranslationRepository
            .findByTagIdAndLanguage(tagId, targetLang)
            .orElse(TagTranslation.builder()
                .tag(tag)
                .language(targetLang)
                .build());

        translation.setName(translatedName);

        tagTranslationRepository.save(translation);
        markTaskDone(TranslationTaskEntityType.TAG, tagId, targetLang);
        log.info("Auto-translated tag {} to {}", tagId, targetLang);
    }

    /**
     * Short text: use DeepL (faster, cheaper). Falls back to Claude if DeepL fails.
     */
    private String translateShort(String text, Language source, Language target) {
        if (text == null || text.isBlank()) return text;
        String result = deepLClient.translate(text, source, target);
        if (result == null) {
            result = claudeClient.translate(text, source, target);
        }
        return result;
    }

    /**
     * Long/HTML content: use Claude (better with HTML structure). Falls back to DeepL.
     */
    private String translateLong(String text, Language source, Language target) {
        if (text == null || text.isBlank()) return text;
        String result = claudeClient.translate(text, source, target);
        if (result == null) {
            result = deepLClient.translate(text, source, target);
        }
        return result;
    }

    private List<Language> targetLanguages(Language source) {
        return java.util.Arrays.stream(Language.values())
            .filter(l -> l != source)
            .toList();
    }

    private void markTaskDone(TranslationTaskEntityType entityType, Long entityId, Language targetLang) {
        translationTaskRepository.findByEntityTypeAndEntityId(entityType, entityId).stream()
            .filter(t -> t.getTargetLang() == targetLang && t.getStatus() != TranslationTaskStatus.DONE)
            .forEach(t -> {
                t.setStatus(TranslationTaskStatus.DONE);
                translationTaskRepository.save(t);
            });
    }

    private String getArticleField(Article article, Language lang, String field) {
        if (lang != Language.DEFAULT) {
            ArticleTranslation t = article.getTranslations().get(lang);
            if (t != null) {
                return switch (field) {
                    case "title" -> t.getTitle();
                    case "excerpt" -> t.getExcerpt();
                    case "body" -> t.getBody();
                    case "metaTitle" -> t.getMetaTitle();
                    case "metaDescription" -> t.getMetaDescription();
                    default -> null;
                };
            }
        }
        return switch (field) {
            case "title" -> article.getTitle();
            case "excerpt" -> article.getExcerpt();
            case "body" -> article.getBody();
            case "metaTitle" -> article.getMetaTitle();
            case "metaDescription" -> article.getMetaDescription();
            default -> null;
        };
    }

    private String getCategoryField(Category category, Language lang, String field) {
        if (lang != Language.DEFAULT) {
            CategoryTranslation t = category.getTranslations().get(lang);
            if (t != null) {
                return switch (field) {
                    case "name" -> t.getName();
                    case "displayName" -> t.getDisplayName();
                    case "description" -> t.getDescription();
                    default -> null;
                };
            }
        }
        return switch (field) {
            case "name" -> category.getName();
            case "displayName" -> category.getDisplayName();
            case "description" -> category.getDescription();
            default -> null;
        };
    }

    private String getAuthorBio(Author author, Language lang) {
        if (lang != Language.DEFAULT) {
            AuthorTranslation t = author.getTranslations().get(lang);
            if (t != null && t.getBio() != null) return t.getBio();
        }
        return author.getBio();
    }
}
