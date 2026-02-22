package de.tzr.dto;

import java.util.List;

public record CategoryDTO(
    Long id, String name, String slug, String displayName,
    String description, String emoji, String color, String bgColor,
    String type, Integer sortOrder, Integer articleCount,
    List<CategoryTranslationDTO> translations
) {}
