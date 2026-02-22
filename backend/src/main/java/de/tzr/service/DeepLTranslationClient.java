package de.tzr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.tzr.config.TranslationProperties;
import de.tzr.model.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeepLTranslationClient {

    private final TranslationProperties props;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public String translate(String text, Language sourceLang, Language targetLang) {
        if (text == null || text.isBlank()) return text;
        if (!props.isDeepLConfigured()) {
            log.warn("DeepL API key not configured, skipping translation");
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "DeepL-Auth-Key " + props.getDeepl().getApiKey());

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("text", text);
            body.add("source_lang", toDeepLLang(sourceLang));
            body.add("target_lang", toDeepLLang(targetLang));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                props.getDeepl().getApiUrl(), HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode translations = root.get("translations");
                if (translations != null && translations.isArray() && !translations.isEmpty()) {
                    return translations.get(0).get("text").asText();
                }
            }
            log.error("DeepL translation failed: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("DeepL translation error for text '{}...': {}", text.substring(0, Math.min(50, text.length())), e.getMessage());
            return null;
        }
    }

    private String toDeepLLang(Language lang) {
        return switch (lang) {
            case DE -> "DE";
            case PT -> "PT-PT";
            case EN -> "EN";
        };
    }
}
