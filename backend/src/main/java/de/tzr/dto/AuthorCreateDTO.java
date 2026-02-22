package de.tzr.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record AuthorCreateDTO(
    @NotBlank String name,
    String slug,
    String bio, String email, String avatarUrl,
    List<AuthorTranslationDTO> translations
) {}
