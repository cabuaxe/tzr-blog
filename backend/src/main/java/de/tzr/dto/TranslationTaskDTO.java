package de.tzr.dto;

import java.time.LocalDateTime;

public record TranslationTaskDTO(
    Long id, String entityType, Long entityId, String entityTitle,
    String sourceLang, String targetLang, String status,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
