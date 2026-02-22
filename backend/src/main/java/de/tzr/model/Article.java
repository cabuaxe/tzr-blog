package de.tzr.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String excerpt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @ManyToMany
    @JoinTable(
        name = "article_tags",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @MapKey(name = "language")
    @Builder.Default
    private Map<Language, ArticleTranslation> translations = new HashMap<>();

    private String cardEmoji;
    private String coverImageUrl;
    private String coverImageCredit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    @Builder.Default
    private Boolean academic = false;

    @Builder.Default
    private Boolean featured = false;

    private LocalDate publishedDate;
    private Integer readingTimeMinutes;
    private String metaTitle;
    private String metaDescription;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.slugify(title);
        }
        calculateReadingTime();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateReadingTime();
    }

    private void calculateReadingTime() {
        if (body != null && !body.isBlank()) {
            String text = body.replaceAll("<[^>]*>", "");
            String[] words = text.trim().split("\\s+");
            readingTimeMinutes = Math.max(1, (int) Math.ceil(words.length / 200.0));
        }
    }
}
