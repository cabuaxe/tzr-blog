package de.tzr.repository;

import de.tzr.model.Article;
import de.tzr.model.ArticleStatus;
import de.tzr.model.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    boolean existsBySlug(String slug);

    Page<Article> findByStatus(ArticleStatus status, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.category.slug = :categorySlug")
    Page<Article> findByStatusAndCategorySlug(@Param("status") ArticleStatus status, @Param("categorySlug") String categorySlug, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.author.slug = :authorSlug")
    Page<Article> findByStatusAndAuthorSlug(@Param("status") ArticleStatus status, @Param("authorSlug") String authorSlug, Pageable pageable);

    @Query("SELECT a FROM Article a JOIN a.tags t WHERE a.status = :status AND t.slug = :tagSlug")
    Page<Article> findByStatusAndTagSlug(@Param("status") ArticleStatus status, @Param("tagSlug") String tagSlug, Pageable pageable);

    Page<Article> findByStatusAndAcademic(ArticleStatus status, Boolean academic, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.category.type = :type")
    Page<Article> findByStatusAndCategoryType(@Param("status") ArticleStatus status, @Param("type") CategoryType type, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = :status AND (LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.excerpt) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.body) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Article> search(@Param("status") ArticleStatus status, @Param("q") String query, Pageable pageable);

    Optional<Article> findByFeaturedTrueAndStatus(ArticleStatus status);

    long countByStatus(ArticleStatus status);

    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.category.slug = :categorySlug AND a.id <> :excludeId ORDER BY a.publishedDate DESC")
    Page<Article> findRelated(@Param("status") ArticleStatus status, @Param("categorySlug") String categorySlug, @Param("excludeId") Long excludeId, Pageable pageable);

    long countByAuthorId(Long authorId);
    long countByCategoryId(Long categoryId);

    @Query("SELECT a.category.id, COUNT(a) FROM Article a GROUP BY a.category.id")
    List<Object[]> countGroupedByCategoryId();

    @Query("SELECT a.author.id, COUNT(a) FROM Article a GROUP BY a.author.id")
    List<Object[]> countGroupedByAuthorId();
}
