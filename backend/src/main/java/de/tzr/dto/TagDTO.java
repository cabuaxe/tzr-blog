package de.tzr.dto;

import java.util.List;

public record TagDTO(Long id, String name, String slug, Integer articleCount,
                     List<TagTranslationDTO> translations) {}
