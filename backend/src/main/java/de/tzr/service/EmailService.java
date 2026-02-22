package de.tzr.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${newsletter.from}")
    private String fromEmail;

    @Value("${newsletter.from-name}")
    private String fromName;

    @Value("${newsletter.base-url}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String confirmUrl = baseUrl + "/api/public/newsletter/confirm?token=" + token;
        String subject = "Bitte bestätigen Sie Ihre Newsletter-Anmeldung";
        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
                  <h2 style="color: #1a1a2e; font-size: 1.4rem;">Willkommen bei TZR!</h2>
                  <p style="color: #333; line-height: 1.7;">
                    Vielen Dank für Ihr Interesse an unseren Bildungsimpulsen.
                    Bitte bestätigen Sie Ihre Anmeldung, indem Sie auf den folgenden Link klicken:
                  </p>
                  <p style="text-align: center; margin: 2rem 0;">
                    <a href="%s"
                       style="display: inline-block; padding: 0.75rem 2rem; background: #3a9e7e; color: #fff;
                              border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                      Anmeldung bestätigen
                    </a>
                  </p>
                  <p style="color: #666; font-size: 0.85rem; line-height: 1.6;">
                    Dieser Link ist 24 Stunden gültig. Falls Sie sich nicht angemeldet haben,
                    können Sie diese E-Mail einfach ignorieren.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;" />
                  <p style="color: #999; font-size: 0.75rem;">
                    TZR — Frühkindliche Bildung · tzr.zuacaldeira.com
                  </p>
                </div>
                """.formatted(confirmUrl);

        sendHtmlEmail(toEmail, subject, html);
    }

    public void sendWelcomeEmail(String toEmail) {
        String subject = "Willkommen beim TZR-Newsletter!";
        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
                  <h2 style="color: #1a1a2e; font-size: 1.4rem;">Ihre Anmeldung ist bestätigt! 🎉</h2>
                  <p style="color: #333; line-height: 1.7;">
                    Vielen Dank! Sie erhalten ab sofort unsere monatlichen Bildungsimpulse
                    mit neuen Praxisideen und Fachartikeln direkt in Ihr Postfach.
                  </p>
                  <p style="color: #333; line-height: 1.7;">
                    Besuchen Sie uns jederzeit auf
                    <a href="https://tzr.zuacaldeira.com" style="color: #3a9e7e; text-decoration: none; font-weight: 600;">
                      tzr.zuacaldeira.com
                    </a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;" />
                  <p style="color: #999; font-size: 0.75rem;">
                    TZR — Frühkindliche Bildung · tzr.zuacaldeira.com
                  </p>
                </div>
                """;

        sendHtmlEmail(toEmail, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("E-Mail konnte nicht gesendet werden.", e);
        } catch (java.io.UnsupportedEncodingException e) {
            log.error("Encoding error for from-name: {}", e.getMessage());
            throw new RuntimeException("E-Mail konnte nicht gesendet werden.", e);
        }
    }
}
