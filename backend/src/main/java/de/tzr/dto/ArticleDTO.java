package de.tzr.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ArticleDTO(
    Long id, String title, String slug, String excerpt, String body,
    CategoryDTO category, AuthorDTO author, List<TagDTO> tags,
    String cardEmoji, String coverImageUrl, String coverImageCredit,
    String status, Boolean academic, Boolean featured,
    LocalDate publishedDate, Integer readingTimeMinutes,
    String metaTitle, String metaDescription,
    LocalDateTime createdAt, LocalDateTime updatedAt,
    List<ArticleTranslationDTO> translations
) {}
