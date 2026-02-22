package de.tzr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CategoryCreateDTO(
    @NotBlank String name,
    String slug,
    @NotBlank String displayName,
    String description, String emoji, String color, String bgColor,
    @NotNull String type,
    Integer sortOrder,
    List<CategoryTranslationDTO> translations
) {}
