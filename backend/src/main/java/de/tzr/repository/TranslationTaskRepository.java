package de.tzr.repository;

import de.tzr.model.TranslationTask;
import de.tzr.model.TranslationTaskEntityType;
import de.tzr.model.TranslationTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TranslationTaskRepository extends JpaRepository<TranslationTask, Long> {
    List<TranslationTask> findByStatus(TranslationTaskStatus status);
    long countByStatus(TranslationTaskStatus status);
    List<TranslationTask> findByEntityTypeAndEntityId(TranslationTaskEntityType entityType, Long entityId);
}
