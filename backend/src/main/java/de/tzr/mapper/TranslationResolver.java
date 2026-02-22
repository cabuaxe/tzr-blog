package de.tzr.mapper;

public final class TranslationResolver {

    private TranslationResolver() {}

    public static String resolve(String primary, String fallback, String entityField) {
        if (primary != null && !primary.isBlank()) return primary;
        if (fallback != null && !fallback.isBlank()) return fallback;
        return entityField;
    }
}
