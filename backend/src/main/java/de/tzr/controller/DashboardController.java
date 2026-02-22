package de.tzr.controller;

import de.tzr.model.ArticleStatus;
import de.tzr.model.TranslationTaskStatus;
import de.tzr.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final TranslationTaskRepository translationTaskRepository;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalArticles", articleRepository.count());
        stats.put("publishedArticles", articleRepository.countByStatus(ArticleStatus.PUBLISHED));
        stats.put("draftArticles", articleRepository.countByStatus(ArticleStatus.DRAFT));
        stats.put("archivedArticles", articleRepository.countByStatus(ArticleStatus.ARCHIVED));
        stats.put("categories", categoryRepository.count());
        stats.put("authors", authorRepository.count());
        stats.put("subscribers", subscriberRepository.count());
        stats.put("pendingTranslations", translationTaskRepository.countByStatus(TranslationTaskStatus.PENDING));
        return stats;
    }
}
