package de.tzr.controller;

import de.tzr.dto.AuthorDTO;
import de.tzr.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/authors")
@RequiredArgsConstructor
public class PublicAuthorController {

    private final AuthorService authorService;

    @GetMapping("/{slug}")
    public AuthorDTO getBySlug(@PathVariable String slug) {
        return authorService.getBySlug(slug);
    }
}
