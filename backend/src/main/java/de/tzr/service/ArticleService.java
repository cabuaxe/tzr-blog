package de.tzr.service;

import de.tzr.dto.*;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.exception.SlugAlreadyExistsException;
import de.tzr.mapper.ArticleMapper;
import de.tzr.model.*;
import de.tzr.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final TagRepository tagRepository;
    private final ArticleTranslationRepository articleTranslationRepository;
    private final ArticleMapper articleMapper;
    private final TranslationTaskService translationTaskService;
    private final AutoTranslationService autoTranslationService;

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getAllPublished(Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.findByStatus(ArticleStatus.PUBLISHED, pageable), lang);
    }

    @Transactional(readOnly = true)
    public ArticleDTO getBySlug(String slug, Language lang) {
        Article article = articleRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + slug));
        return articleMapper.toDTO(article, lang);
    }

    @Transactional(readOnly = true)
    public ArticleDTO getFeatured(Language lang) {
        Article article = articleRepository.findByFeaturedTrueAndStatus(ArticleStatus.PUBLISHED)
            .orElseThrow(() -> new ResourceNotFoundException("No featured article found"));
        return articleMapper.toDTO(article, lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> search(String query, Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.search(ArticleStatus.PUBLISHED, query, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getByCategory(String categorySlug, Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.findByStatusAndCategorySlug(ArticleStatus.PUBLISHED, categorySlug, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getByAuthor(String authorSlug, Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.findByStatusAndAuthorSlug(ArticleStatus.PUBLISHED, authorSlug, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getByTag(String tagSlug, Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.findByStatusAndTagSlug(ArticleStatus.PUBLISHED, tagSlug, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getAcademic(Language lang, Pageable pageable) {
        return toPageResponse(articleRepository.findByStatusAndAcademic(ArticleStatus.PUBLISHED, true, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getByCategoryType(String type, Language lang, Pageable pageable) {
        CategoryType categoryType = CategoryType.valueOf(type);
        return toPageResponse(articleRepository.findByStatusAndCategoryType(ArticleStatus.PUBLISHED, categoryType, pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getRelated(String slug, Language lang, Pageable pageable) {
        Article article = articleRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + slug));
        return toPageResponse(articleRepository.findRelated(
            ArticleStatus.PUBLISHED, article.getCategory().getSlug(), article.getId(), pageable), lang);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getAllAdmin(Pageable pageable) {
        return toPageResponse(articleRepository.findAll(pageable), Language.DEFAULT);
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleListDTO> getByStatusAdmin(String status, Pageable pageable) {
        ArticleStatus articleStatus = ArticleStatus.valueOf(status);
        return toPageResponse(articleRepository.findByStatus(articleStatus, pageable), Language.DEFAULT);
    }

    @Transactional(readOnly = true)
    public ArticleDTO getByIdAdmin(Long id) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        return articleMapper.toDTO(article);
    }

    public ArticleDTO create(ArticleCreateDTO dto) {
        String slug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.title());
        if (articleRepository.existsBySlug(slug)) {
            throw new SlugAlreadyExistsException(slug);
        }

        Category category = categoryRepository.findById(dto.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.categoryId()));
        Author author = authorRepository.findById(dto.authorId())
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + dto.authorId()));

        Set<Tag> tags = new HashSet<>();
        if (dto.tagIds() != null) {
            tags.addAll(tagRepository.findAllById(dto.tagIds()));
        }

        Article article = Article.builder()
            .title(dto.title())
            .slug(slug)
            .excerpt(dto.excerpt())
            .body(dto.body())
            .category(category)
            .author(author)
            .tags(tags)
            .cardEmoji(dto.cardEmoji())
            .coverImageUrl(dto.coverImageUrl())
            .coverImageCredit(dto.coverImageCredit())
            .status(dto.status() != null ? ArticleStatus.valueOf(dto.status()) : ArticleStatus.DRAFT)
            .academic(dto.academic() != null ? dto.academic() : false)
            .featured(dto.featured() != null ? dto.featured() : false)
            .publishedDate(dto.publishedDate())
            .readingTimeMinutes(dto.readingTimeMinutes())
            .metaTitle(dto.metaTitle())
            .metaDescription(dto.metaDescription())
            .build();

        if (article.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDate.now());
        }

        article = articleRepository.save(article);
        saveTranslations(article, dto.translations());
        translationTaskService.createTasksForEntity(TranslationTaskEntityType.ARTICLE, article.getId());
        autoTranslationService.translateArticle(article.getId(), Language.DEFAULT);

        return articleMapper.toDTO(article);
    }

    public ArticleDTO update(Long id, ArticleCreateDTO dto) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));

        String newSlug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.title());
        if (!newSlug.equals(article.getSlug()) && articleRepository.existsBySlug(newSlug)) {
            throw new SlugAlreadyExistsException(newSlug);
        }

        Category category = categoryRepository.findById(dto.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.categoryId()));
        Author author = authorRepository.findById(dto.authorId())
            .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + dto.authorId()));

        article.setTitle(dto.title());
        article.setSlug(newSlug);
        article.setExcerpt(dto.excerpt());
        article.setBody(dto.body());
        article.setCategory(category);
        article.setAuthor(author);
        if (dto.tagIds() != null) {
            article.setTags(new HashSet<>(tagRepository.findAllById(dto.tagIds())));
        }
        article.setCardEmoji(dto.cardEmoji());
        article.setCoverImageUrl(dto.coverImageUrl());
        article.setCoverImageCredit(dto.coverImageCredit());
        if (dto.status() != null) {
            article.setStatus(ArticleStatus.valueOf(dto.status()));
        }
        article.setAcademic(dto.academic() != null ? dto.academic() : article.getAcademic());
        article.setFeatured(dto.featured() != null ? dto.featured() : article.getFeatured());
        article.setPublishedDate(dto.publishedDate() != null ? dto.publishedDate() : article.getPublishedDate());
        article.setReadingTimeMinutes(dto.readingTimeMinutes());
        article.setMetaTitle(dto.metaTitle());
        article.setMetaDescription(dto.metaDescription());

        if (article.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDate.now());
        }

        article = articleRepository.save(article);
        saveTranslations(article, dto.translations());
        autoTranslationService.translateArticle(article.getId(), Language.DEFAULT);

        return articleMapper.toDTO(article);
    }

    public void changeStatus(Long id, String status) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        article.setStatus(ArticleStatus.valueOf(status));
        if (article.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDate.now());
        }
        articleRepository.save(article);
    }

    public void toggleFeatured(Long id) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        if (!article.getFeatured()) {
            articleRepository.findByFeaturedTrueAndStatus(ArticleStatus.PUBLISHED)
                .ifPresent(current -> {
                    current.setFeatured(false);
                    articleRepository.save(current);
                });
        }
        article.setFeatured(!article.getFeatured());
        articleRepository.save(article);
    }

    public void delete(Long id, boolean hard) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        if (hard) {
            articleRepository.delete(article);
        } else {
            article.setStatus(ArticleStatus.ARCHIVED);
            articleRepository.save(article);
        }
    }

    private void saveTranslations(Article article, List<ArticleTranslationDTO> translations) {
        if (translations == null) return;
        for (ArticleTranslationDTO dto : translations) {
            Language lang = Language.valueOf(dto.language());
            ArticleTranslation t = article.getTranslations().get(lang);
            if (t == null) {
                t = ArticleTranslation.builder()
                    .article(article)
                    .language(lang)
                    .build();
            }
            t.setTitle(dto.title());
            t.setExcerpt(dto.excerpt());
            t.setBody(dto.body());
            t.setMetaTitle(dto.metaTitle());
            t.setMetaDescription(dto.metaDescription());
            t.setReadingTimeMinutes(dto.readingTimeMinutes());
            article.getTranslations().put(lang, t);
            articleTranslationRepository.save(t);
        }
    }

    private PageResponse<ArticleListDTO> toPageResponse(Page<Article> page, Language lang) {
        List<ArticleListDTO> content = page.getContent().stream()
            .map(a -> articleMapper.toListDTO(a, lang)).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
