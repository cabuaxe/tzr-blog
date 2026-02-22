package de.tzr.controller;

import de.tzr.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/public/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @Value("${newsletter.base-url}")
    private String baseUrl;

    @PostMapping
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-Mail-Adresse ist erforderlich."));
        }
        String message = newsletterService.subscribe(email);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    @GetMapping("/confirm")
    public ResponseEntity<Void> confirmSubscription(@RequestParam String token) {
        try {
            newsletterService.confirmSubscription(token);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseUrl + "/?subscribed=true"))
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseUrl + "/?subscribed=error"))
                    .build();
        }
    }
}
