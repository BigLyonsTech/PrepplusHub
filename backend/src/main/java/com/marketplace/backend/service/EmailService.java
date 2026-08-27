package com.marketplace.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Sends mail via Resend's HTTP API rather than raw SMTP — Render blocks
 * outbound SMTP ports (25/465/587) on its plans, so a JavaMailSender-based
 * approach can never connect there regardless of credentials. An HTTPS API
 * call sidesteps that entirely.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient;
    private final boolean configured;
    private final String from;
    private final String adminEmail;
    private final String frontendUrl;

    public EmailService(
            @Value("${app.notifications.resend-api-key:}") String apiKey,
            @Value("${app.mail.from:PrepplusHub <onboarding@resend.dev>}") String from,
            @Value("${app.notifications.admin-email:}") String adminEmail,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.configured = !apiKey.isBlank();
        this.from = from;
        this.adminEmail = adminEmail;
        this.frontendUrl = frontendUrl;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public boolean isConfigured() {
        return configured;
    }

    /** Returns true if the email was actually sent. */
    public boolean sendOtp(String toEmail, String otp) {
        return send(
                toEmail,
                "Your PrepplusHub verification code",
                "Your verification code is: " + otp + "\n\n"
                + "This code expires in 10 minutes. If you didn't request this, you can ignore this email."
        );
    }

    public boolean sendOrderConfirmation(String toEmail, String orderId, double total) {
        return send(
                toEmail,
                "Your PrepplusHub order is confirmed",
                "Thanks for your order!\n\n"
                + "Order #" + shortId(orderId) + " — total ₦" + format(total) + "\n\n"
                + "Track it any time: " + frontendUrl + "/orders/" + orderId
        );
    }

    public boolean notifyAdminNewOrder(String orderId, double total, String customerDescriptor) {
        if (adminEmail.isBlank()) return false;
        return send(
                adminEmail,
                "New order on PrepplusHub — ₦" + format(total),
                "New order #" + shortId(orderId) + " from " + customerDescriptor + " — total ₦" + format(total) + "\n\n"
                + "Open the admin dashboard: " + frontendUrl + "/admin?section=" + encode("Activity Log")
        );
    }

    public boolean notifyAdminNewVendorApplication(String businessName, String vendorEmail) {
        if (adminEmail.isBlank()) return false;
        return send(
                adminEmail,
                "New vendor application: " + businessName,
                businessName + " (" + vendorEmail + ") just submitted a vendor application.\n\n"
                + "Review it: " + frontendUrl + "/admin?section=" + encode("Vendor Queue")
        );
    }

    private boolean send(String toEmail, String subject, String body) {
        if (!configured) return false;
        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", from,
                            "to", List.of(toEmail),
                            "subject", subject,
                            "text", body
                    ))
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, subject, e);
            return false;
        }
    }

    private static String shortId(String orderId) {
        return orderId != null && orderId.length() > 8 ? orderId.substring(orderId.length() - 8) : orderId;
    }

    private static String format(double amount) {
        return String.format("%,.0f", amount);
    }

    private static String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
