package de.tzr.repository;

import de.tzr.model.Language;
import de.tzr.model.TagTranslation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagTranslationRepository extends JpaRepository<TagTranslation, Long> {
    Optional<TagTranslation> findByTagIdAndLanguage(Long tagId, Language language);
    List<TagTranslation> findByTagId(Long tagId);
}
