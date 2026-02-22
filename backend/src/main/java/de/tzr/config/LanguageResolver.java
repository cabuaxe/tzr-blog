package de.tzr.config;

import de.tzr.model.Language;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class LanguageResolver {

    public Language resolve(String langParam, HttpServletRequest request) {
        // 1. Explicit ?lang= parameter
        if (langParam != null && !langParam.isBlank()) {
            try {
                return Language.valueOf(langParam.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        // 2. Accept-Language header
        String acceptLang = request.getHeader("Accept-Language");
        if (acceptLang != null) {
            String primary = acceptLang.split("[,;]")[0].trim().toLowerCase();
            if (primary.startsWith("pt")) return Language.PT;
            if (primary.startsWith("en")) return Language.EN;
            if (primary.startsWith("de")) return Language.DE;
        }
        // 3. Default
        return Language.DEFAULT;
    }

    public Language resolve(String langParam) {
        if (langParam != null && !langParam.isBlank()) {
            try {
                return Language.valueOf(langParam.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        return Language.DEFAULT;
    }
}
