package de.tzr.seed;

import de.tzr.model.*;
import de.tzr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final TagRepository tagRepository;
    private final ArticleRepository articleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ArticleTranslationRepository articleTranslationRepository;
    private final CategoryTranslationRepository categoryTranslationRepository;
    private final AuthorTranslationRepository authorTranslationRepository;
    private final TagTranslationRepository tagTranslationRepository;
    private final TranslationTaskRepository translationTaskRepository;

    @Value("${ADMIN_PASSWORD:tzr2026}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database...");
        seedAdminUser();
        List<Category> categories = seedCategories();
        List<Author> authors = seedAuthors();
        Map<String, Tag> tags = seedTags();
        seedArticles(categories, authors, tags);
        log.info("Database seeding complete.");
    }

    private void seedAdminUser() {
        AdminUser admin = AdminUser.builder()
            .username("admin")
            .passwordHash(passwordEncoder.encode(adminPassword))
            .displayName("Administrator")
            .role(AdminRole.ADMIN)
            .build();
        adminUserRepository.save(admin);
        log.info("Admin user created.");
    }

    private List<Category> seedCategories() {
        List<Category> categories = List.of(
            cat("GESUNDHEIT", "gesundheit", "Gesundheit", "K\u00f6rper, Bewegung und Gesundheit \u2013 Grundlagen f\u00fcr ein gesundes Aufwachsen.", "\uD83D\uDC9A", "#3a9e7e", "#e5f5ef", CategoryType.BILDUNGSBEREICH, 1),
            cat("SOZIALES", "soziales", "Soziales & kulturelles Leben", "Soziale und kulturelle Bildung \u2013 Zusammenleben, Vielfalt und Zugeh\u00f6rigkeit.", "\uD83E\uDD1D", "#d4763e", "#fdf0e6", CategoryType.BILDUNGSBEREICH, 2),
            cat("KOMMUNIKATION", "kommunikation", "Kommunikation", "Sprache, Schriftkultur und Kommunikation \u2013 Schl\u00fcssel zur Welt.", "\uD83D\uDCAC", "#4a7fd4", "#e6effb", CategoryType.BILDUNGSBEREICH, 3),
            cat("KUNST", "kunst", "Kunst", "Bildnerisches Gestalten, Musik und Theaterspiel \u2013 \u00c4sthetische Bildung.", "\uD83C\uDFA8", "#c24a8a", "#fce6f1", CategoryType.BILDUNGSBEREICH, 4),
            cat("MATHEMATIK", "mathematik", "Mathematik", "Mathematische Grunderfahrungen \u2013 Muster, Zahlen und Formen.", "\uD83D\uDD22", "#7b61d4", "#eeebfb", CategoryType.BILDUNGSBEREICH, 5),
            cat("NATUR", "natur", "Natur \u2013 Umwelt \u2013 Technik", "Naturwissenschaftliche und technische Grunderfahrungen.", "\uD83C\uDF3F", "#5a9e3a", "#ecf5e5", CategoryType.BILDUNGSBEREICH, 6),
            cat("PARTIZIPATION", "partizipation", "Partizipation", "Beteiligung und Mitbestimmung \u2013 Demokratiebildung von Anfang an.", "\uD83D\uDDF3\uFE0F", "#9e6b3a", "#f5ede5", CategoryType.QUERSCHNITTSAUFGABE, 7),
            cat("INKLUSION", "inklusion", "Inklusion", "Inklusive P\u00e4dagogik \u2013 Teilhabe und Barrierefreiheit.", "\u267F", "#8e5a3a", "#f5ebe5", CategoryType.QUERSCHNITTSAUFGABE, 8),
            cat("UEBERGAENGE", "uebergaenge", "\u00dcberg\u00e4nge gestalten", "Transitionen begleiten \u2013 Von der Familie in die Kita und weiter.", "\uD83D\uDEB8", "#7a6b3a", "#f3f0e5", CategoryType.QUERSCHNITTSAUFGABE, 9),
            cat("GENDER", "gender", "Geschlechterbewusste P\u00e4dagogik", "Geschlechtersensible Bildung und Erziehung.", "\u2696\uFE0F", "#9e5a6b", "#f5e5ed", CategoryType.QUERSCHNITTSAUFGABE, 10),
            cat("NACHHALTIGKEIT", "nachhaltigkeit", "Nachhaltigkeit", "Bildung f\u00fcr nachhaltige Entwicklung (BNE) in der Kita.", "\u267B\uFE0F", "#5a8e3a", "#eaf3e5", CategoryType.QUERSCHNITTSAUFGABE, 11),
            cat("MEDIENKOMPETENZ", "medienkompetenz", "Medienkompetenz", "Digitale Bildung und Medienerziehung in der fr\u00fchen Kindheit.", "\uD83D\uDCF1", "#3a6b9e", "#e5edf5", CategoryType.QUERSCHNITTSAUFGABE, 12)
        );
        List<Category> saved = categoryRepository.saveAll(categories);
        for (Category c : saved) {
            categoryTranslationRepository.save(CategoryTranslation.builder()
                .category(c).language(Language.DE).name(c.getName())
                .displayName(c.getDisplayName()).description(c.getDescription()).build());
            createPendingTasks(TranslationTaskEntityType.CATEGORY, c.getId());
        }
        log.info("Created {} categories with DE translations.", saved.size());
        return saved;
    }

    private Category cat(String name, String slug, String displayName, String description, String emoji, String color, String bgColor, CategoryType type, int order) {
        return Category.builder().name(name).slug(slug).displayName(displayName).description(description)
            .emoji(emoji).color(color).bgColor(bgColor).type(type).sortOrder(order).build();
    }

    private List<Author> seedAuthors() {
        List<Author> authors = List.of(
            Author.builder().name("Redaktion").slug("redaktion")
                .bio("Die Redaktion von TZR besteht aus erfahrenen P\u00e4dagog:innen und Bildungswissenschaftler:innen, die praxisnahe Impulse f\u00fcr den Kita-Alltag aufbereiten.")
                .build(),
            Author.builder().name("Dr. Lisa Hartmann").slug("lisa-hartmann")
                .bio("Erziehungswissenschaftlerin mit Schwerpunkt fr\u00fchkindliche Bildung an der Alice Salomon Hochschule Berlin. Forschungsinteressen: Sprachbildung, Inklusion, Qualit\u00e4tsentwicklung.")
                .build(),
            Author.builder().name("Prof. Thomas Weber").slug("thomas-weber")
                .bio("Professor f\u00fcr Elementarp\u00e4dagogik an der Evangelischen Hochschule Berlin. Autor zahlreicher Fachpublikationen zu Partizipation und Demokratiebildung in Kitas.")
                .build()
        );
        List<Author> saved = authorRepository.saveAll(authors);
        for (Author a : saved) {
            authorTranslationRepository.save(AuthorTranslation.builder()
                .author(a).language(Language.DE).bio(a.getBio()).build());
            createPendingTasks(TranslationTaskEntityType.AUTHOR, a.getId());
        }
        log.info("Created {} authors with DE translations.", saved.size());
        return saved;
    }

    private Map<String, Tag> seedTags() {
        String[] tagNames = {
            "BBP", "Praxisimpulse", "Theorie", "Bewegung", "Ern\u00e4hrung", "Resilienz", "Salutogenese",
            "Anti-Bias", "Diversit\u00e4t", "Sprachbildung", "Mehrsprachigkeit", "Scaffolding", "BeoKiz",
            "Reggio", "\u00c4sthetik", "Mathe-Kings", "MINT", "Forschen", "Nachhaltigkeit", "BNE",
            "Kinderrechte", "Eingew\u00f6hnung", "Schul\u00fcbergang", "Medienp\u00e4dagogik", "Raumgestaltung",
            "Beobachtung", "Dokumentation"
        };
        Map<String, Tag> tagMap = new LinkedHashMap<>();
        for (String name : tagNames) {
            Tag tag = Tag.builder().name(name).slug(SlugUtil.slugify(name)).build();
            tag = tagRepository.save(tag);
            tagTranslationRepository.save(TagTranslation.builder()
                .tag(tag).language(Language.DE).name(tag.getName()).build());
            createPendingTasks(TranslationTaskEntityType.TAG, tag.getId());
            tagMap.put(name, tag);
        }
        log.info("Created {} tags with DE translations.", tagMap.size());
        return tagMap;
    }

    private void seedArticles(List<Category> categories, List<Author> authors, Map<String, Tag> tags) {
        Map<String, Category> catMap = new HashMap<>();
        for (Category c : categories) catMap.put(c.getSlug(), c);

        Map<String, Author> authorMap = new HashMap<>();
        for (Author a : authors) authorMap.put(a.getSlug(), a);

        // Article definitions: slug, title, categorySlug, emoji, authorSlug, date, featured, academic, coverUrl, credit, tagNames
        createArticle(catMap, authorMap, tags, "berliner-bildungsprogramm-verstehen",
            "Das Berliner Bildungsprogramm verstehen und anwenden", "kommunikation", "\uD83E\uDDED", "redaktion",
            LocalDate.of(2026, 2, 10), true, false,
            "https://images.pexels.com/photos/8363102/pexels-photo-8363102.jpeg", "RDNE Stock project",
            List.of("BBP", "Praxisimpulse"));

        createArticle(catMap, authorMap, tags, "bewegung-als-bildungsmotor",
            "Bewegung als Bildungsmotor: K\u00f6rperliche Erfahrungen im Kita-Alltag", "gesundheit", "\uD83C\uDFC3\u200D\u2642\uFE0F", "redaktion",
            LocalDate.of(2026, 2, 8), false, false,
            "https://images.pexels.com/photos/4885131/pexels-photo-4885131.jpeg", "Skyler Ewing",
            List.of("Praxisimpulse", "Bewegung"));

        createArticle(catMap, authorMap, tags, "vielfalt-im-gruppenraum",
            "Vielfalt im Gruppenraum: Soziale Kompetenz von Anfang an", "soziales", "\uD83C\uDF0D", "lisa-hartmann",
            LocalDate.of(2026, 2, 5), false, false,
            "https://images.pexels.com/photos/8422173/pexels-photo-8422173.jpeg", "Pavel Danilyuk",
            List.of("Praxisimpulse", "Anti-Bias", "Diversit\u00e4t"));

        createArticle(catMap, authorMap, tags, "alltagsintegrierte-sprachbildung",
            "Alltagsintegrierte Sprachbildung: Jeder Moment z\u00e4hlt", "kommunikation", "\uD83D\uDCD6", "lisa-hartmann",
            LocalDate.of(2026, 2, 2), false, false,
            "https://images.pexels.com/photos/3662630/pexels-photo-3662630.jpeg", "cottonbro studio",
            List.of("Praxisimpulse", "Sprachbildung", "Mehrsprachigkeit", "BeoKiz", "Beobachtung", "Dokumentation"));

        createArticle(catMap, authorMap, tags, "kreatives-gestalten-ohne-schablonen",
            "Kreatives Gestalten ohne Schablonen", "kunst", "\uD83C\uDFAD", "redaktion",
            LocalDate.of(2026, 1, 30), false, false,
            "https://images.pexels.com/photos/8612991/pexels-photo-8612991.jpeg", "Yan Krukau",
            List.of("Praxisimpulse", "Reggio", "\u00c4sthetik", "Raumgestaltung"));

        createArticle(catMap, authorMap, tags, "mathematik-entdecken",
            "Mathematik entdecken: Muster, Mengen und Formen im Alltag", "mathematik", "\uD83D\uDD3A", "redaktion",
            LocalDate.of(2026, 1, 27), false, false,
            "https://images.pexels.com/photos/207665/pexels-photo-207665.jpeg", "Pixabay",
            List.of("Praxisimpulse", "Mathe-Kings", "MINT"));

        createArticle(catMap, authorMap, tags, "kleine-forscher-grosse-fragen",
            "Kleine Forscher, gro\u00dfe Fragen: Naturwissenschaft in der Kita", "natur", "\uD83D\uDD2C", "thomas-weber",
            LocalDate.of(2026, 1, 24), false, false,
            "https://images.pexels.com/photos/16724787/pexels-photo-16724787.jpeg", "Yakup Polat",
            List.of("Praxisimpulse", "MINT", "Forschen", "Beobachtung", "Dokumentation"));

        createArticle(catMap, authorMap, tags, "partizipation-in-der-kita",
            "Partizipation in der Kita: Demokratie von klein auf", "partizipation", "\uD83D\uDDF3\uFE0F", "thomas-weber",
            LocalDate.of(2026, 1, 22), false, false,
            "https://images.pexels.com/photos/8382387/pexels-photo-8382387.jpeg", "Pavel Danilyuk",
            List.of("Praxisimpulse", "Kinderrechte"));

        createArticle(catMap, authorMap, tags, "inklusion-als-haltung",
            "Inklusion als Haltung: Jedes Kind geh\u00f6rt dazu", "inklusion", "\uD83E\uDD32", "lisa-hartmann",
            LocalDate.of(2026, 1, 19), false, false,
            "https://images.pexels.com/photos/8382271/pexels-photo-8382271.jpeg", "Pavel Danilyuk",
            List.of("Praxisimpulse"));

        createArticle(catMap, authorMap, tags, "uebergaenge-gestalten",
            "\u00dcberg\u00e4nge gestalten: Von der Familie in die Kita und weiter", "uebergaenge", "\uD83D\uDEB8", "redaktion",
            LocalDate.of(2026, 1, 16), false, false,
            "https://images.pexels.com/photos/30709005/pexels-photo-30709005.jpeg", "Isaac Naph",
            List.of("Praxisimpulse", "Eingew\u00f6hnung", "Schul\u00fcbergang"));

        // Academic articles
        createArticle(catMap, authorMap, tags, "salutogenese-kita",
            "Gesundheitsf\u00f6rderung in der Kita: Salutogenese als p\u00e4dagogisches Leitprinzip", "gesundheit", "\uD83E\uDEC0", "lisa-hartmann",
            LocalDate.of(2026, 2, 11), false, true,
            "https://images.pexels.com/photos/8467263/pexels-photo-8467263.jpeg", "Anastasia Shuraeva",
            List.of("BBP", "Theorie", "Bewegung", "Ern\u00e4hrung", "Resilienz", "Salutogenese"));

        createArticle(catMap, authorMap, tags, "anti-bias-ansatz-kitas",
            "Vorurteilsbewusste Bildung und Erziehung: Der Anti-Bias-Ansatz in Berliner Kitas", "soziales", "\uD83D\uDD0D", "thomas-weber",
            LocalDate.of(2026, 2, 9), false, true,
            "https://images.pexels.com/photos/6157556/pexels-photo-6157556.jpeg", "cottonbro studio",
            List.of("BBP", "Theorie", "Anti-Bias", "Diversit\u00e4t", "Raumgestaltung"));

        createArticle(catMap, authorMap, tags, "scaffolding-sustained-shared-thinking",
            "Scaffolding und sustained shared thinking: Sprachbildungsstrategien im fr\u00fchp\u00e4dagogischen Dialog", "kommunikation", "\uD83D\uDDE3\uFE0F", "lisa-hartmann",
            LocalDate.of(2026, 2, 7), false, true,
            "https://images.pexels.com/photos/3662630/pexels-photo-3662630.jpeg", "cottonbro studio",
            List.of("BBP", "Theorie", "Sprachbildung", "Mehrsprachigkeit", "Scaffolding"));

        createArticle(catMap, authorMap, tags, "aesthetische-bildung-reggio",
            "\u00c4sthetische Bildung in der fr\u00fchen Kindheit: Zwischen Reggio-P\u00e4dagogik und den hundert Sprachen des Kindes", "kunst", "\uD83D\uDD8C\uFE0F", "thomas-weber",
            LocalDate.of(2026, 2, 4), false, true,
            "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg", "Alexander Grey",
            List.of("Theorie", "Reggio", "\u00c4sthetik", "Raumgestaltung"));

        createArticle(catMap, authorMap, tags, "mathematische-grunderfahrungen",
            "Mathematische Grunderfahrungen: Von der Mengenlehre zur mathematischen Literacy", "mathematik", "\uD83D\uDCD0", "lisa-hartmann",
            LocalDate.of(2026, 2, 1), false, true,
            "https://images.pexels.com/photos/207665/pexels-photo-207665.jpeg", "Pixabay",
            List.of("Theorie", "Mathe-Kings", "MINT"));

        createArticle(catMap, authorMap, tags, "forschendes-lernen-ibse",
            "Forschendes Lernen im Kita-Alltag: Inquiry-Based Science Education in der fr\u00fchen Kindheit", "natur", "\uD83E\uDDEA", "thomas-weber",
            LocalDate.of(2026, 1, 29), false, true,
            "https://images.pexels.com/photos/29132351/pexels-photo-29132351.jpeg", "Junchen Zhou",
            List.of("Theorie", "MINT", "Forschen", "BNE"));

        createArticle(catMap, authorMap, tags, "partizipation-kinderrecht",
            "Partizipation als Kinderrecht: Demokratiebildung in der Kita zwischen Anspruch und Alltagsrealit\u00e4t", "partizipation", "\u2696\uFE0F", "thomas-weber",
            LocalDate.of(2026, 1, 25), false, true,
            "https://images.pexels.com/photos/8363102/pexels-photo-8363102.jpeg", "RDNE Stock project",
            List.of("BBP", "Theorie", "Kinderrechte"));

        createArticle(catMap, authorMap, tags, "index-fuer-inklusion",
            "Index f\u00fcr Inklusion in der Kita: Von der Salamanca-Erkl\u00e4rung zur inklusiven Praxis", "inklusion", "\uD83C\uDF08", "lisa-hartmann",
            LocalDate.of(2026, 1, 23), false, true,
            "https://images.pexels.com/photos/8422173/pexels-photo-8422173.jpeg", "Pavel Danilyuk",
            List.of("Theorie", "Diversit\u00e4t"));

        createArticle(catMap, authorMap, tags, "transitionen-fruehe-kindheit",
            "Transitionen in der fr\u00fchen Kindheit: Theoretische Modelle und ihre Bedeutung f\u00fcr die Eingew\u00f6hnungspraxis", "uebergaenge", "\uD83C\uDF09", "redaktion",
            LocalDate.of(2026, 1, 20), false, true,
            "https://images.pexels.com/photos/30709005/pexels-photo-30709005.jpeg", "Isaac Naph",
            List.of("Theorie", "Eingew\u00f6hnung", "Schul\u00fcbergang"));

        createArticle(catMap, authorMap, tags, "geschlechterbewusste-paedagogik",
            "Geschlechterbewusste P\u00e4dagogik in der Kita: Zwischen Doing Gender und Undoing Gender", "gender", "\uD83E\uDE9E", "lisa-hartmann",
            LocalDate.of(2026, 1, 17), false, true,
            "https://images.pexels.com/photos/3933257/pexels-photo-3933257.jpeg", "Tatiana Syrikova",
            List.of("Theorie"));

        createArticle(catMap, authorMap, tags, "bne-kita-hochbeet",
            "Bildung f\u00fcr nachhaltige Entwicklung in der Kita: Vom Hochbeet zum Weltwissen", "nachhaltigkeit", "\uD83C\uDF0E", "thomas-weber",
            LocalDate.of(2026, 1, 14), false, true,
            "https://images.pexels.com/photos/16724787/pexels-photo-16724787.jpeg", "Yakup Polat",
            List.of("Theorie", "Nachhaltigkeit", "BNE"));

        createArticle(catMap, authorMap, tags, "digitale-bildung-medienkompetenz",
            "Digitale Bildung in der Kita: Medienkompetenz zwischen Schutz und Teilhabe", "medienkompetenz", "\uD83D\uDCA1", "redaktion",
            LocalDate.of(2026, 1, 11), false, true,
            "https://images.pexels.com/photos/4885131/pexels-photo-4885131.jpeg", "Skyler Ewing",
            List.of("Theorie", "Medienp\u00e4dagogik"));

        log.info("Created {} articles.", articleRepository.count());
    }

    private void createArticle(Map<String, Category> catMap, Map<String, Author> authorMap, Map<String, Tag> tags,
                               String slug, String title, String categorySlug, String emoji, String authorSlug,
                               LocalDate date, boolean featured, boolean academic,
                               String coverUrl, String credit, List<String> tagNames) {
        String body = loadArticleBody(slug);
        String excerpt = generateExcerpt(body);

        Set<Tag> articleTags = new HashSet<>();
        for (String tagName : tagNames) {
            Tag tag = tags.get(tagName);
            if (tag != null) articleTags.add(tag);
        }

        Article article = Article.builder()
            .title(title)
            .slug(slug)
            .excerpt(excerpt)
            .body(body)
            .category(catMap.get(categorySlug))
            .author(authorMap.get(authorSlug))
            .tags(articleTags)
            .cardEmoji(emoji)
            .coverImageUrl(coverUrl)
            .coverImageCredit(credit)
            .status(ArticleStatus.PUBLISHED)
            .academic(academic)
            .featured(featured)
            .publishedDate(date)
            .build();

        article = articleRepository.save(article);
        articleTranslationRepository.save(ArticleTranslation.builder()
            .article(article).language(Language.DE).title(article.getTitle())
            .excerpt(article.getExcerpt()).body(article.getBody())
            .metaTitle(article.getTitle()).metaDescription(article.getExcerpt())
            .readingTimeMinutes(Math.max(1, Math.round(article.getBody().replaceAll("<[^>]*>", "").trim().split("\\s+").length / 200.0f)))
            .build());
        createPendingTasks(TranslationTaskEntityType.ARTICLE, article.getId());
    }

    private void createPendingTasks(TranslationTaskEntityType entityType, Long entityId) {
        for (Language targetLang : List.of(Language.PT, Language.EN)) {
            translationTaskRepository.save(TranslationTask.builder()
                .entityType(entityType).entityId(entityId)
                .sourceLang(Language.DE).targetLang(targetLang)
                .status(TranslationTaskStatus.PENDING).build());
        }
    }

    private String loadArticleBody(String slug) {
        try {
            ClassPathResource resource = new ClassPathResource("data/articles/" + slug + ".html");
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("Article body not found for slug: {}. Using placeholder.", slug);
            return "<p>Dieser Artikel wird in K\u00fcrze ver\u00f6ffentlicht.</p>";
        }
    }

    private String generateExcerpt(String html) {
        String text = html.replaceAll("<[^>]*>", "").trim();
        if (text.length() > 280) {
            text = text.substring(0, 280);
            int lastSpace = text.lastIndexOf(' ');
            if (lastSpace > 200) text = text.substring(0, lastSpace);
            text += "\u2026";
        }
        return text;
    }
}
