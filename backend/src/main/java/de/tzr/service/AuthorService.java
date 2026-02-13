package de.tzr.service;

import de.tzr.dto.AuthorCreateDTO;
import de.tzr.dto.AuthorDTO;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.exception.SlugAlreadyExistsException;
import de.tzr.mapper.AuthorMapper;
import de.tzr.model.Author;
import de.tzr.model.SlugUtil;
import de.tzr.repository.ArticleRepository;
import de.tzr.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final ArticleRepository articleRepository;
    private final AuthorMapper authorMapper;

    @Transactional(readOnly = true)
    public List<AuthorDTO> getAll() {
        return authorRepository.findAll().stream()
            .map(a -> authorMapper.toDTO(a, (int) articleRepository.countByAuthorId(a.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public AuthorDTO getBySlug(String slug) {
        Author author = authorRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + slug));
        return authorMapper.toDTO(author, (int) articleRepository.countByAuthorId(author.getId()));
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
        return authorMapper.toDTO(authorRepository.save(author));
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

        return authorMapper.toDTO(authorRepository.save(author));
    }

    public void delete(Long id) {
        Author author = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + id));
        long count = articleRepository.countByAuthorId(id);
        if (count > 0) {
            throw new IllegalStateException(
                "Autor kann nicht gel\u00f6scht werden: Es existieren noch " + count + " Beitr\u00e4ge dieses Autors.");
        }
        authorRepository.delete(author);
    }
}
