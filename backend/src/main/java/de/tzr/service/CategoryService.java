package de.tzr.service;

import de.tzr.dto.CategoryCreateDTO;
import de.tzr.dto.CategoryDTO;
import de.tzr.dto.CategoryTranslationDTO;
import de.tzr.exception.ResourceNotFoundException;
import de.tzr.exception.SlugAlreadyExistsException;
import de.tzr.mapper.CategoryMapper;
import de.tzr.model.*;
import de.tzr.repository.ArticleRepository;
import de.tzr.repository.CategoryRepository;
import de.tzr.repository.CategoryTranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final CategoryTranslationRepository categoryTranslationRepository;
    private final CategoryMapper categoryMapper;
    private final TranslationTaskService translationTaskService;
    private final AutoTranslationService autoTranslationService;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAll() {
        return getAll(Language.DEFAULT);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAll(Language lang) {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
            .map(c -> categoryMapper.toDTO(c, (int) articleRepository.countByCategoryId(c.getId()), lang))
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDTO getBySlug(String slug) {
        return getBySlug(slug, Language.DEFAULT);
    }

    @Transactional(readOnly = true)
    public CategoryDTO getBySlug(String slug, Language lang) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        return categoryMapper.toDTO(category, (int) articleRepository.countByCategoryId(category.getId()), lang);
    }

    @Transactional(readOnly = true)
    public CategoryDTO getById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        return categoryMapper.toDTO(category, (int) articleRepository.countByCategoryId(id));
    }

    public CategoryDTO create(CategoryCreateDTO dto) {
        String slug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.name());
        if (categoryRepository.existsBySlug(slug)) {
            throw new SlugAlreadyExistsException(slug);
        }
        Category category = categoryMapper.toEntity(dto);
        category.setSlug(slug);
        category = categoryRepository.save(category);
        saveTranslations(category, dto.translations());
        translationTaskService.createTasksForEntity(TranslationTaskEntityType.CATEGORY, category.getId());
        autoTranslationService.translateCategory(category.getId(), Language.DEFAULT);
        return categoryMapper.toDTO(category);
    }

    public CategoryDTO update(Long id, CategoryCreateDTO dto) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        String newSlug = (dto.slug() != null && !dto.slug().isBlank()) ? dto.slug() : SlugUtil.slugify(dto.name());
        if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
            throw new SlugAlreadyExistsException(newSlug);
        }

        category.setName(dto.name());
        category.setSlug(newSlug);
        category.setDisplayName(dto.displayName());
        category.setDescription(dto.description());
        category.setEmoji(dto.emoji());
        category.setColor(dto.color());
        category.setBgColor(dto.bgColor());
        category.setType(CategoryType.valueOf(dto.type()));
        if (dto.sortOrder() != null) category.setSortOrder(dto.sortOrder());

        category = categoryRepository.save(category);
        saveTranslations(category, dto.translations());
        autoTranslationService.translateCategory(category.getId(), Language.DEFAULT);
        return categoryMapper.toDTO(category);
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        long count = articleRepository.countByCategoryId(id);
        if (count > 0) {
            throw new IllegalStateException(
                "Kategorie kann nicht gelöscht werden: Es existieren noch " + count + " Beiträge in dieser Kategorie.");
        }
        categoryRepository.delete(category);
    }

    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Category category = categoryRepository.findById(orderedIds.get(i))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            category.setSortOrder(i);
            categoryRepository.save(category);
        }
    }

    private void saveTranslations(Category category, List<CategoryTranslationDTO> translations) {
        if (translations == null) return;
        for (CategoryTranslationDTO dto : translations) {
            Language lang = Language.valueOf(dto.language());
            CategoryTranslation t = category.getTranslations().get(lang);
            if (t == null) {
                t = CategoryTranslation.builder()
                    .category(category)
                    .language(lang)
                    .build();
            }
            t.setName(dto.name());
            t.setDisplayName(dto.displayName());
            t.setDescription(dto.description());
            category.getTranslations().put(lang, t);
            categoryTranslationRepository.save(t);
        }
    }
}
