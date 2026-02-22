package de.tzr.mapper;

import static de.tzr.mapper.TranslationResolver.resolve;

import de.tzr.dto.*;
import de.tzr.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ArticleMapper {

    private final CategoryMapper categoryMapper;
    private final AuthorMapper authorMapper;

    public ArticleMapper(CategoryMapper categoryMapper, AuthorMapper authorMapper) {
        this.categoryMapper = categoryMapper;
        this.authorMapper = authorMapper;
    }

    public ArticleDTO toDTO(Article a) {
        return toDTO(a, Language.DEFAULT);
    }

    public ArticleDTO toDTO(Article a, Language lang) {
        ArticleTranslation t = a.getTranslations().get(lang);
        ArticleTranslation fallback = (t == null && lang != Language.DE) ? a.getTranslations().get(Language.DE) : null;

        String title = resolve(t != null ? t.getTitle() : null, fallback != null ? fallback.getTitle() : null, a.getTitle());
        String excerpt = resolve(t != null ? t.getExcerpt() : null, fallback != null ? fallback.getExcerpt() : null, a.getExcerpt());
        String body = resolve(t != null ? t.getBody() : null, fallback != null ? fallback.getBody() : null, a.getBody());
        String metaTitle = resolve(t != null ? t.getMetaTitle() : null, fallback != null ? fallback.getMetaTitle() : null, a.getMetaTitle());
        String metaDesc = resolve(t != null ? t.getMetaDescription() : null, fallback != null ? fallback.getMetaDescription() : null, a.getMetaDescription());
        Integer readTime = t != null && t.getReadingTimeMinutes() != null ? t.getReadingTimeMinutes() :
            (fallback != null && fallback.getReadingTimeMinutes() != null ? fallback.getReadingTimeMinutes() : a.getReadingTimeMinutes());

        List<ArticleTranslationDTO> translations = a.getTranslations().values().stream()
            .map(tr -> new ArticleTranslationDTO(
                tr.getLanguage().name(), tr.getTitle(), tr.getExcerpt(), tr.getBody(),
                tr.getMetaTitle(), tr.getMetaDescription(), tr.getReadingTimeMinutes()))
            .toList();

        return new ArticleDTO(
            a.getId(), title, a.getSlug(), excerpt, body,
            categoryMapper.toDTO(a.getCategory(), 0, lang),
            authorMapper.toDTO(a.getAuthor(), 0, lang),
            a.getTags().stream().map(tag -> toTagDTO(tag, lang)).toList(),
            a.getCardEmoji(), a.getCoverImageUrl(), a.getCoverImageCredit(),
            a.getStatus().name(), a.getAcademic(), a.getFeatured(),
            a.getPublishedDate(), readTime,
            metaTitle, metaDesc,
            a.getCreatedAt(), a.getUpdatedAt(),
            translations
        );
    }

    public ArticleListDTO toListDTO(Article a) {
        return toListDTO(a, Language.DEFAULT);
    }

    public ArticleListDTO toListDTO(Article a, Language lang) {
        ArticleTranslation t = a.getTranslations().get(lang);
        ArticleTranslation fallback = (t == null && lang != Language.DE) ? a.getTranslations().get(Language.DE) : null;

        String title = resolve(t != null ? t.getTitle() : null, fallback != null ? fallback.getTitle() : null, a.getTitle());
        String excerpt = resolve(t != null ? t.getExcerpt() : null, fallback != null ? fallback.getExcerpt() : null, a.getExcerpt());
        Integer readTime = t != null && t.getReadingTimeMinutes() != null ? t.getReadingTimeMinutes() :
            (fallback != null && fallback.getReadingTimeMinutes() != null ? fallback.getReadingTimeMinutes() : a.getReadingTimeMinutes());

        return new ArticleListDTO(
            a.getId(), title, a.getSlug(), excerpt,
            categoryMapper.toDTO(a.getCategory(), 0, lang),
            authorMapper.toDTO(a.getAuthor(), 0, lang),
            a.getTags().stream().map(tag -> toTagDTO(tag, lang)).toList(),
            a.getCardEmoji(), a.getCoverImageUrl(),
            a.getStatus().name(), a.getAcademic(), a.getFeatured(),
            a.getPublishedDate(), readTime
        );
    }

    private TagDTO toTagDTO(Tag t, Language lang) {
        TagTranslation tr = t.getTranslations().get(lang);
        TagTranslation fallback = (tr == null && lang != Language.DE) ? t.getTranslations().get(Language.DE) : null;
        String name = resolve(tr != null ? tr.getName() : null, fallback != null ? fallback.getName() : null, t.getName());
        return new TagDTO(t.getId(), name, t.getSlug(), 0, null);
    }
}
