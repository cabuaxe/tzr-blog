package de.tzr.repository;

import de.tzr.model.AuthorTranslation;
import de.tzr.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorTranslationRepository extends JpaRepository<AuthorTranslation, Long> {
    Optional<AuthorTranslation> findByAuthorIdAndLanguage(Long authorId, Language language);
    List<AuthorTranslation> findByAuthorId(Long authorId);
}
