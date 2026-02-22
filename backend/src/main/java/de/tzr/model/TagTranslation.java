package de.tzr.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tag_translations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"tag_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(nullable = false)
    private String name;
}
