package de.tzr.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "article_translations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"article_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String metaTitle;
    private String metaDescription;
    private Integer readingTimeMinutes;
}
