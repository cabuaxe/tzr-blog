package de.tzr.mapper;

import de.tzr.dto.*;
import de.tzr.model.Article;
import de.tzr.model.Tag;
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
        return new ArticleDTO(
            a.getId(), a.getTitle(), a.getSlug(), a.getExcerpt(), a.getBody(),
            categoryMapper.toDTO(a.getCategory()),
            authorMapper.toDTO(a.getAuthor()),
            a.getTags().stream().map(this::toTagDTO).toList(),
            a.getCardEmoji(), a.getCoverImageUrl(), a.getCoverImageCredit(),
            a.getStatus().name(), a.getAcademic(), a.getFeatured(),
            a.getPublishedDate(), a.getReadingTimeMinutes(),
            a.getMetaTitle(), a.getMetaDescription(),
            a.getCreatedAt(), a.getUpdatedAt()
        );
    }

    public ArticleListDTO toListDTO(Article a) {
        return new ArticleListDTO(
            a.getId(), a.getTitle(), a.getSlug(), a.getExcerpt(),
            categoryMapper.toDTO(a.getCategory()),
            authorMapper.toDTO(a.getAuthor()),
            a.getTags().stream().map(this::toTagDTO).toList(),
            a.getCardEmoji(), a.getCoverImageUrl(),
            a.getStatus().name(), a.getAcademic(), a.getFeatured(),
            a.getPublishedDate(), a.getReadingTimeMinutes()
        );
    }

    private TagDTO toTagDTO(Tag t) {
        return new TagDTO(t.getId(), t.getName(), t.getSlug(), 0);
    }
}
