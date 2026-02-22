package de.tzr.repository;

import de.tzr.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    boolean existsByEmail(String email);
    Optional<NewsletterSubscriber> findByEmail(String email);
    Optional<NewsletterSubscriber> findByConfirmationToken(String token);
}
