package de.tzr.dto;

public record ArticleTranslationDTO(
    String language, String title, String excerpt, String body,
    String metaTitle, String metaDescription, Integer readingTimeMinutes
) {}
