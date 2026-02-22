package de.tzr.repository;

import de.tzr.model.ArticleTranslation;
import de.tzr.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleTranslationRepository extends JpaRepository<ArticleTranslation, Long> {
    Optional<ArticleTranslation> findByArticleIdAndLanguage(Long articleId, Language language);
    List<ArticleTranslation> findByArticleId(Long articleId);
}
