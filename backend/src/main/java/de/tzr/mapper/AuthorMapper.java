package de.tzr.mapper;

import de.tzr.dto.AuthorCreateDTO;
import de.tzr.dto.AuthorDTO;
import de.tzr.model.Author;
import de.tzr.model.SlugUtil;
import org.springframework.stereotype.Component;

@Component
public class AuthorMapper {

    public AuthorDTO toDTO(Author a) {
        return toDTO(a, 0);
    }

    public AuthorDTO toDTO(Author a, int articleCount) {
        return new AuthorDTO(
            a.getId(), a.getName(), a.getSlug(), a.getBio(),
            a.getEmail(), a.getAvatarUrl(), articleCount
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
