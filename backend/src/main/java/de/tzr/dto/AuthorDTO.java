package de.tzr.dto;

import java.util.List;

public record AuthorDTO(
    Long id, String name, String slug, String bio,
    String email, String avatarUrl, Integer articleCount,
    List<AuthorTranslationDTO> translations
) {}
