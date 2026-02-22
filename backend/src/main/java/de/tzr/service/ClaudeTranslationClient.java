package de.tzr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.tzr.config.TranslationProperties;
import de.tzr.model.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaudeTranslationClient {

    private final TranslationProperties props;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public String translate(String text, Language sourceLang, Language targetLang) {
        if (text == null || text.isBlank()) return text;
        if (!props.isClaudeConfigured()) {
            log.warn("Claude API key not configured, skipping translation");
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", props.getClaude().getApiKey());
            headers.set("anthropic-version", "2023-06-01");

            String sourceName = langName(sourceLang);
            String targetName = langName(targetLang);

            String systemPrompt = "You are a professional translator for an educational blog about early childhood education " +
                "(frühkindliche Bildung). Translate the following content from " + sourceName + " to " + targetName + ". " +
                "Preserve ALL HTML tags, structure, and formatting exactly as-is. " +
                "Only translate the text content between/around HTML tags. " +
                "Maintain the educational and professional tone. " +
                "Return ONLY the translated content, no explanations or wrapping.";

            Map<String, Object> body = Map.of(
                "model", props.getClaude().getModel(),
                "max_tokens", 8192,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", text))
            );

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.exchange(
                props.getClaude().getApiUrl(), HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode content = root.get("content");
                if (content != null && content.isArray() && !content.isEmpty()) {
                    return content.get(0).get("text").asText();
                }
            }
            log.error("Claude translation failed: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("Claude translation error: {}", e.getMessage());
            return null;
        }
    }

    private String langName(Language lang) {
        return switch (lang) {
            case DE -> "German";
            case PT -> "Portuguese";
            case EN -> "English";
        };
    }
}
