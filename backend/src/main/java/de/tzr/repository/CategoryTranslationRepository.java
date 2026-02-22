package de.tzr.repository;

import de.tzr.model.CategoryTranslation;
import de.tzr.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryTranslationRepository extends JpaRepository<CategoryTranslation, Long> {
    Optional<CategoryTranslation> findByCategoryIdAndLanguage(Long categoryId, Language language);
    List<CategoryTranslation> findByCategoryId(Long categoryId);
}
