package de.tzr.service;

import de.tzr.model.NewsletterSubscriber;
import de.tzr.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterSubscriberRepository subscriberRepository;
    private final EmailService emailService;

    public String subscribe(String email) {
        Optional<NewsletterSubscriber> existing = subscriberRepository.findByEmail(email);

        if (existing.isPresent()) {
            NewsletterSubscriber subscriber = existing.get();
            if (Boolean.TRUE.equals(subscriber.getConfirmed())) {
                return "Diese E-Mail-Adresse ist bereits angemeldet.";
            }
            // Resend verification for unconfirmed subscriber
            String token = generateToken();
            subscriber.setConfirmationToken(token);
            subscriber.setTokenExpiresAt(LocalDateTime.now().plusHours(24));
            subscriberRepository.save(subscriber);
            emailService.sendVerificationEmail(email, token);
            return "Bitte überprüfen Sie Ihr Postfach und bestätigen Sie Ihre Anmeldung.";
        }

        // New subscriber
        String token = generateToken();
        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(email)
                .confirmationToken(token)
                .tokenExpiresAt(LocalDateTime.now().plusHours(24))
                .build();
        subscriberRepository.save(subscriber);
        emailService.sendVerificationEmail(email, token);
        return "Bitte überprüfen Sie Ihr Postfach und bestätigen Sie Ihre Anmeldung.";
    }

    public String confirmSubscription(String token) {
        NewsletterSubscriber subscriber = subscriberRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Ungültiger Bestätigungslink."));

        if (subscriber.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Der Bestätigungslink ist abgelaufen. Bitte melden Sie sich erneut an.");
        }

        subscriber.setConfirmed(true);
        subscriber.setConfirmationToken(null);
        subscriber.setTokenExpiresAt(null);
        subscriberRepository.save(subscriber);

        emailService.sendWelcomeEmail(subscriber.getEmail());
        return "Ihre Anmeldung wurde erfolgreich bestätigt!";
    }

    public long getCount() {
        return subscriberRepository.count();
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}
