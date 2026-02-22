package de.tzr.mapper;

import static de.tzr.mapper.TranslationResolver.resolve;

import de.tzr.dto.AuthorCreateDTO;
import de.tzr.dto.AuthorDTO;
import de.tzr.dto.AuthorTranslationDTO;
import de.tzr.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthorMapper {

    public AuthorDTO toDTO(Author a) {
        return toDTO(a, 0, Language.DEFAULT);
    }

    public AuthorDTO toDTO(Author a, int articleCount) {
        return toDTO(a, articleCount, Language.DEFAULT);
    }

    public AuthorDTO toDTO(Author a, int articleCount, Language lang) {
        AuthorTranslation t = a.getTranslations().get(lang);
        AuthorTranslation fallback = (t == null && lang != Language.DE) ? a.getTranslations().get(Language.DE) : null;

        String bio = resolve(t != null ? t.getBio() : null, fallback != null ? fallback.getBio() : null, a.getBio());

        List<AuthorTranslationDTO> translations = a.getTranslations().values().stream()
            .map(tr -> new AuthorTranslationDTO(tr.getLanguage().name(), tr.getBio()))
            .toList();

        return new AuthorDTO(
            a.getId(), a.getName(), a.getSlug(), bio,
            a.getEmail(), a.getAvatarUrl(), articleCount,
            translations
        );
    }

    public Author toEntity(AuthorCreateDTO dto) {
        return Author.builder()
            .name(dto.name())
            .slug(dto.slug() != null && !dto.slug().isBlank() ? dto.slug() : SlugUtil.slugify(dto.name()))
            .bio(dto.bio())
            .email(dto.email())
            .avatarUrl(dto.avatarUrl())
            .build();
    }
}
