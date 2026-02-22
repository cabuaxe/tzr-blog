package de.tzr.service;

import de.tzr.dto.TagDTO;
import de.tzr.dto.TagTranslationDTO;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.exception.SlugAlreadyExistsException;
import de.tzr.model.*;
import de.tzr.repository.TagRepository;
import de.tzr.repository.TagTranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagRepository tagRepository;
    private final TagTranslationRepository tagTranslationRepository;
    private final TranslationTaskService translationTaskService;
    private final AutoTranslationService autoTranslationService;

    @Transactional(readOnly = true)
    public List<TagDTO> getAll() {
        return tagRepository.findAll().stream()
            .map(t -> {
                List<TagTranslationDTO> translations = t.getTranslations().values().stream()
                    .map(tr -> new TagTranslationDTO(tr.getLanguage().name(), tr.getName()))
                    .toList();
                return new TagDTO(t.getId(), t.getName(), t.getSlug(),
                    t.getArticles() != null ? t.getArticles().size() : 0, translations);
            })
            .toList();
    }

    public TagDTO create(String name) {
        String slug = SlugUtil.slugify(name);
        if (tagRepository.existsBySlug(slug)) {
            throw new SlugAlreadyExistsException(slug);
        }
        Tag tag = Tag.builder().name(name).slug(slug).build();
        tag = tagRepository.save(tag);
        translationTaskService.createTasksForEntity(TranslationTaskEntityType.TAG, tag.getId());
        autoTranslationService.translateTag(tag.getId(), Language.DEFAULT);
        return new TagDTO(tag.getId(), tag.getName(), tag.getSlug(), 0, null);
    }

    public TagDTO update(Long id, String name) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        String newSlug = SlugUtil.slugify(name);
        if (!newSlug.equals(tag.getSlug()) && tagRepository.existsBySlug(newSlug)) {
            throw new SlugAlreadyExistsException(newSlug);
        }
        tag.setName(name);
        tag.setSlug(newSlug);
        tag = tagRepository.save(tag);
        return new TagDTO(tag.getId(), tag.getName(), tag.getSlug(),
            tag.getArticles() != null ? tag.getArticles().size() : 0, null);
    }

    public void delete(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        for (Article article : tag.getArticles()) {
            article.getTags().remove(tag);
        }
        tagRepository.delete(tag);
    }

    public void merge(Long sourceId, Long targetId) {
        Tag source = tagRepository.findById(sourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Source tag not found: " + sourceId));
        Tag target = tagRepository.findById(targetId)
            .orElseThrow(() -> new ResourceNotFoundException("Target tag not found: " + targetId));

        for (Article article : source.getArticles()) {
            article.getTags().remove(source);
            article.getTags().add(target);
        }
        tagRepository.delete(source);
    }
}
