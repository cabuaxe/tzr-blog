package de.tzr.dto;

public record CategoryTranslationDTO(
    String language, String name, String displayName, String description
) {}
