package de.tzr.controller;

import de.tzr.config.LanguageResolver;
import de.tzr.dto.CategoryDTO;
import de.tzr.model.Language;
import de.tzr.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;
    private final LanguageResolver languageResolver;

    @GetMapping
    public List<CategoryDTO> getAll(@RequestParam(required = false) String lang) {
        return categoryService.getAll(languageResolver.resolve(lang));
    }

    @GetMapping("/{slug}")
    public CategoryDTO getBySlug(@PathVariable String slug,
                                 @RequestParam(required = false) String lang) {
        return categoryService.getBySlug(slug, languageResolver.resolve(lang));
    }
}
