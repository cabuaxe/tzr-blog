package de.tzr.controller;

import de.tzr.config.LanguageResolver;
import de.tzr.dto.ArticleDTO;
import de.tzr.dto.ArticleListDTO;
import de.tzr.dto.PageResponse;
import de.tzr.model.Language;
import de.tzr.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/articles")
@RequiredArgsConstructor
public class PublicArticleController {

    private final ArticleService articleService;
    private final LanguageResolver languageResolver;

    @GetMapping
    public PageResponse<ArticleListDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean academic,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String lang,
            @RequestParam(defaultValue = "publishedDate,desc") String sort) {

        Pageable pageable = createPageable(page, Math.min(size, 50), sort);
        Language language = languageResolver.resolve(lang);

        if (category != null) return articleService.getByCategory(category, language, pageable);
        if (author != null) return articleService.getByAuthor(author, language, pageable);
        if (tag != null) return articleService.getByTag(tag, language, pageable);
        if (academic != null && academic) return articleService.getAcademic(language, pageable);
        if (type != null) return articleService.getByCategoryType(type, language, pageable);
        return articleService.getAllPublished(language, pageable);
    }

    @GetMapping("/{slug}")
    public ArticleDTO getBySlug(@PathVariable String slug,
                                @RequestParam(required = false) String lang) {
        return articleService.getBySlug(slug, languageResolver.resolve(lang));
    }

    @GetMapping("/featured")
    public ArticleDTO getFeatured(@RequestParam(required = false) String lang) {
        return articleService.getFeatured(languageResolver.resolve(lang));
    }

    @GetMapping("/search")
    public PageResponse<ArticleListDTO> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String lang) {
        return articleService.search(q, languageResolver.resolve(lang), PageRequest.of(page, Math.min(size, 50)));
    }

    @GetMapping("/{slug}/related")
    public PageResponse<ArticleListDTO> getRelated(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,
            @RequestParam(required = false) String lang) {
        return articleService.getRelated(slug, languageResolver.resolve(lang), PageRequest.of(page, size));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] parts = sort.split(",");
        String field = parts[0];
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, field));
    }
}
