package de.tzr.mapper;

import static de.tzr.mapper.TranslationResolver.resolve;

import de.tzr.dto.CategoryCreateDTO;
import de.tzr.dto.CategoryDTO;
import de.tzr.dto.CategoryTranslationDTO;
import de.tzr.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category c) {
        return toDTO(c, 0, Language.DEFAULT);
    }

    public CategoryDTO toDTO(Category c, int articleCount) {
        return toDTO(c, articleCount, Language.DEFAULT);
    }

    public CategoryDTO toDTO(Category c, int articleCount, Language lang) {
        CategoryTranslation t = c.getTranslations().get(lang);
        CategoryTranslation fallback = (t == null && lang != Language.DE) ? c.getTranslations().get(Language.DE) : null;

        String name = resolve(t != null ? t.getName() : null, fallback != null ? fallback.getName() : null, c.getName());
        String displayName = resolve(t != null ? t.getDisplayName() : null, fallback != null ? fallback.getDisplayName() : null, c.getDisplayName());
        String description = resolve(t != null ? t.getDescription() : null, fallback != null ? fallback.getDescription() : null, c.getDescription());

        List<CategoryTranslationDTO> translations = c.getTranslations().values().stream()
            .map(tr -> new CategoryTranslationDTO(
                tr.getLanguage().name(), tr.getName(), tr.getDisplayName(), tr.getDescription()))
            .toList();

        return new CategoryDTO(
            c.getId(), name, c.getSlug(), displayName,
            description, c.getEmoji(), c.getColor(), c.getBgColor(),
            c.getType().name(), c.getSortOrder(), articleCount,
            translations
        );
    }

    public Category toEntity(CategoryCreateDTO dto) {
        return Category.builder()
            .name(dto.name())
            .slug(dto.slug() != null && !dto.slug().isBlank() ? dto.slug() : SlugUtil.slugify(dto.name()))
            .displayName(dto.displayName())
            .description(dto.description())
            .emoji(dto.emoji())
            .color(dto.color())
            .bgColor(dto.bgColor())
            .type(CategoryType.valueOf(dto.type()))
            .sortOrder(dto.sortOrder() != null ? dto.sortOrder() : 0)
            .build();
    }
}
