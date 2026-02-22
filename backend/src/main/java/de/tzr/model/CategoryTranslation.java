package de.tzr.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category_translations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(nullable = false)
    private String name;

    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
