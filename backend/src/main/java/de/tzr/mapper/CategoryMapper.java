package de.tzr.mapper;

import de.tzr.dto.CategoryCreateDTO;
import de.tzr.dto.CategoryDTO;
import de.tzr.model.Category;
import de.tzr.model.CategoryType;
import de.tzr.model.SlugUtil;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category c) {
        return toDTO(c, 0);
    }

    public CategoryDTO toDTO(Category c, int articleCount) {
        return new CategoryDTO(
            c.getId(), c.getName(), c.getSlug(), c.getDisplayName(),
            c.getDescription(), c.getEmoji(), c.getColor(), c.getBgColor(),
            c.getType().name(), c.getSortOrder(), articleCount
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
