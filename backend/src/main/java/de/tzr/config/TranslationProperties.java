package de.tzr.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "translation")
public class TranslationProperties {

    private boolean autoTranslate = true;

    private DeepL deepl = new DeepL();
    private Claude claude = new Claude();

    @Data
    public static class DeepL {
        private String apiKey = "";
        private String apiUrl = "https://api-free.deepl.com/v2/translate";
    }

    @Data
    public static class Claude {
        private String apiKey = "";
        private String apiUrl = "https://api.anthropic.com/v1/messages";
        private String model = "claude-haiku-4-5-20251001";
    }

    public boolean isDeepLConfigured() {
        return deepl.getApiKey() != null && !deepl.getApiKey().isBlank();
    }

    public boolean isClaudeConfigured() {
        return claude.getApiKey() != null && !claude.getApiKey().isBlank();
    }
}
