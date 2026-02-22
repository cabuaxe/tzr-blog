package de.tzr.controller;

import de.tzr.config.LanguageResolver;
import de.tzr.dto.AuthorDTO;
import de.tzr.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/authors")
@RequiredArgsConstructor
public class PublicAuthorController {

    private final AuthorService authorService;
    private final LanguageResolver languageResolver;

    @GetMapping("/{slug}")
    public AuthorDTO getBySlug(@PathVariable String slug,
                               @RequestParam(required = false) String lang) {
        return authorService.getBySlug(slug, languageResolver.resolve(lang));
    }
}
