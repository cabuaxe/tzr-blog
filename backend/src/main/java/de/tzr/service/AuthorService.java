package de.tzr.service;

import de.tzr.dto.AuthorCreateDTO;
import de.tzr.dto.AuthorDTO;
import de.tzr.dto.AuthorTranslationDTO;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.exception.SlugAlreadyExistsException;
import de.tzr.mapper.AuthorMapper;
import de.tzr.model.*;
import de.tzr.repository.ArticleRepository;
import de.tzr.repository.AuthorRepository;
import de.tzr.repository.AuthorTranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final ArticleRepository articleRepository;
    private final AuthorTranslationRepository authorTranslationRepository;
    private final AuthorMapper authorMapper;
    private final TranslationTaskService translationTaskService;
    private final AutoTranslationService autoTranslationService;

    @Transactional(readOnly = true)
    public List<AuthorDTO> getAll() {
        Map<Long, Long> counts = articleRepository.countGroupedByAuthorId().stream()
            .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));
        return authorRepository.findAll().stream()
            .map(a -> authorMapper.toDTO(a, counts.getOrDefault(a.getId(), 0L).intValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public AuthorDTO getBySlug(String slug) {
        return getBySlug(slug, Language.DEFAULT);
    }

    @Transactional(readOnly = true)
    public AuthorDTO getBySlug(String slug, Language lang) {
        Author author = authorRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + slug));
        return authorMapper.toDTO(author, (int) articleRepository.countByAuthorId(author.getId()), lang);
    }

    @Transactional(readOnly = true)
    public AuthorDTO getById(Long id) {
        Author author = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + id));
        return authorMapper.toDTO(author, (int) articleRepository.countByAuthorId(id));
    }

    public AuthorDTO create(AuthorCreateDTO dto) {
        String slug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.name());
        if (authorRepository.existsBySlug(slug)) {
            throw new SlugAlreadyExistsException(slug);
        }
        Author author = authorMapper.toEntity(dto);
        author.setSlug(slug);
        author = authorRepository.save(author);
        saveTranslations(author, dto.translations());
        translationTaskService.createTasksForEntity(TranslationTaskEntityType.AUTHOR, author.getId());
        autoTranslationService.translateAuthor(author.getId(), Language.DEFAULT);
        return authorMapper.toDTO(author);
    }

    public AuthorDTO update(Long id, AuthorCreateDTO dto) {
        Author author = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + id));

        String newSlug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.name());
        if (!newSlug.equals(author.getSlug()) && authorRepository.existsBySlug(newSlug)) {
            throw new SlugAlreadyExistsException(newSlug);
        }

        author.setName(dto.name());
        author.setSlug(newSlug);
        author.setBio(dto.bio());
        author.setEmail(dto.email());
        author.setAvatarUrl(dto.avatarUrl());

        author = authorRepository.save(author);
        saveTranslations(author, dto.translations());
        autoTranslationService.translateAuthor(author.getId(), Language.DEFAULT);
        return authorMapper.toDTO(author);
    }

    public void delete(Long id) {
        Author author = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + id));
        long count = articleRepository.countByAuthorId(id);
        if (count > 0) {
            throw new IllegalStateException(
                "Autor kann nicht gelöscht werden: Es existieren noch " + count + " Beiträge dieses Autors.");
        }
        authorRepository.delete(author);
    }

    private void saveTranslations(Author author, List<AuthorTranslationDTO> translations) {
        if (translations == null) return;
        for (AuthorTranslationDTO dto : translations) {
            Language lang = Language.valueOf(dto.language());
            AuthorTranslation t = author.getTranslations().get(lang);
            if (t == null) {
                t = AuthorTranslation.builder()
                    .author(author)
                    .language(lang)
                    .build();
            }
            t.setBio(dto.bio());
            author.getTranslations().put(lang, t);
            authorTranslationRepository.save(t);
        }
    }
}
