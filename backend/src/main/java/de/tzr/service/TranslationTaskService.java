package de.tzr.service;

import de.tzr.dto.TranslationTaskDTO;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.model.*;
import de.tzr.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class TranslationTaskService {

    private final TranslationTaskRepository taskRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final TagRepository tagRepository;

    public void createTasksForEntity(TranslationTaskEntityType entityType, Long entityId) {
        for (Language targetLang : List.of(Language.PT, Language.EN)) {
            boolean exists = taskRepository.findByEntityTypeAndEntityId(entityType, entityId).stream()
                .anyMatch(t -> t.getTargetLang() == targetLang && t.getStatus() != TranslationTaskStatus.DONE);
            if (!exists) {
                TranslationTask task = TranslationTask.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .sourceLang(Language.DE)
                    .targetLang(targetLang)
                    .status(TranslationTaskStatus.PENDING)
                    .build();
                taskRepository.save(task);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<TranslationTaskDTO> getPendingTasks() {
        return taskRepository.findByStatus(TranslationTaskStatus.PENDING).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TranslationTaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStats() {
        return Map.of(
            "pending", taskRepository.countByStatus(TranslationTaskStatus.PENDING),
            "inProgress", taskRepository.countByStatus(TranslationTaskStatus.IN_PROGRESS),
            "done", taskRepository.countByStatus(TranslationTaskStatus.DONE)
        );
    }

    public TranslationTaskDTO updateStatus(Long taskId, String status) {
        TranslationTask task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Translation task not found: " + taskId));
        task.setStatus(TranslationTaskStatus.valueOf(status));
        return toDTO(taskRepository.save(task));
    }

    private TranslationTaskDTO toDTO(TranslationTask t) {
        String entityTitle = resolveEntityTitle(t.getEntityType(), t.getEntityId());
        return new TranslationTaskDTO(
            t.getId(), t.getEntityType().name(), t.getEntityId(), entityTitle,
            t.getSourceLang().name(), t.getTargetLang().name(), t.getStatus().name(),
            t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    private String resolveEntityTitle(TranslationTaskEntityType type, Long id) {
        return switch (type) {
            case ARTICLE -> articleRepository.findById(id).map(Article::getTitle).orElse("Unknown Article");
            case CATEGORY -> categoryRepository.findById(id).map(Category::getDisplayName).orElse("Unknown Category");
            case AUTHOR -> authorRepository.findById(id).map(Author::getName).orElse("Unknown Author");
            case TAG -> tagRepository.findById(id).map(Tag::getName).orElse("Unknown Tag");
        };
    }
}
