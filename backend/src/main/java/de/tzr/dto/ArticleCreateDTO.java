package de.tzr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ArticleCreateDTO(
    @NotBlank String title,
    String slug,
    @NotBlank String excerpt,
    @NotBlank String body,
    @NotNull Long categoryId,
    @NotNull Long authorId,
    List<Long> tagIds,
    String cardEmoji,
    String coverImageUrl,
    String coverImageCredit,
    String status,
    Boolean academic,
    Boolean featured,
    LocalDate publishedDate,
    Integer readingTimeMinutes,
    String metaTitle,
    String metaDescription,
    List<ArticleTranslationDTO> translations
) {}
