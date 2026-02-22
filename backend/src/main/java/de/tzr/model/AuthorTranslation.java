package de.tzr.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "author_translations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"author_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(columnDefinition = "TEXT")
    private String bio;
}
